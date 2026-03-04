import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import User from "@/models/User"; 
import  connectDB  from "@/lib/mongodb"; 

// Where avatars will be stored inside /public
const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const email = formData.get("email") as string | null;

    // --- Validation ---
    if (!file || !email) {
      return NextResponse.json(
        { error: "Missing avatar file or email." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, or GIF files are allowed." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 5 MB." },
        { status: 400 }
      );
    }

    // --- Ensure the /public/avatars directory exists ---
    await fs.mkdir(AVATAR_DIR, { recursive: true });

    // --- Build a unique filename ---
    // e.g. "user@example.com" -> "user_example_com_1714000000000.jpg"
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${safeEmail}_${Date.now()}.${ext}`;
    const filePath = path.join(AVATAR_DIR, filename);

    // --- Write the file to disk ---
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // --- Public URL path (served by Next.js static file handling) ---
    const publicPath = `/avatars/${filename}`;

    // --- Update user record in MongoDB ---
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { image: publicPath },
      { new: true }   // return the updated document
    ).lean();

    if (!updatedUser) {
      // Clean up the saved file if the user wasn't found
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error("upload-avatar error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}