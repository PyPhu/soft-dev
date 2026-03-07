import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb"; // ✅ FIXED
import User from "@/models/User";
import { getRoleFromEmail } from "@/lib/user-role";

export async function POST(req: Request) {
  try {
    await connectDB();
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Missing JWT secret on server" },
        { status: 500 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        { message: "Wrong password" },
        { status: 401 }
      );
    }

    const role = getRoleFromEmail(user.email || email);
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    const token = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        name: user.name || "",
        role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login success",
      token,
      user: {
        _id: String(user._id),
        name: user.name || "",
        email: user.email || email,
        image: user.image || "",
        role,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
