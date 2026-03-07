export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const oauthClient = new OAuth2Client(googleClientId);

export async function POST(req: Request) {
  try {
    if (!googleClientId) {
      return NextResponse.json(
        { message: "Missing GOOGLE_CLIENT_ID on server" },
        { status: 500 }
      );
    }

    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Missing JWT secret on server" },
        { status: 500 }
      );
    }

    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json(
        { message: "Missing Google credential" },
        { status: 400 }
      );
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json(
        { message: "Google account email is not verified" },
        { status: 401 }
      );
    }

    await connectDB();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email,
        image: payload.picture || "",
      });
    } else {
      const hasChanges =
        (!user.name && payload.name) ||
        (!user.image && payload.picture);

      if (hasChanges) {
        if (!user.name && payload.name) user.name = payload.name;
        if (!user.image && payload.picture) user.image = payload.picture;
        await user.save();
      }
    }

    const token = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        name: user.name || "",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Google login success",
      token,
      user: {
        name: user.name || "",
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    return NextResponse.json(
      { message: "Google authentication failed" },
      { status: 401 }
    );
  }
}
