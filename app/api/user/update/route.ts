import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Update the user and return the new document
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true } // This returns the updated version
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}