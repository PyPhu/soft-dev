import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { senderId, email, reservationId } = await req.json();

    if (!senderId || !email || !reservationId) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // 1. Find the Receiver by email
    const receiver = await User.findOne({ email });
    if (!receiver) {
      return NextResponse.json({ message: "Receiver user not found" }, { status: 404 });
    }

    // 2. Find the Sender by ID to get their name
    const sender = await User.findById(senderId);
    if (!sender) {
      return NextResponse.json({ message: "Sender user not found" }, { status: 404 });
    }

    // 3. Check if invitation already exists
    const exist = await Invitation.findOne({
      receiver: receiver._id,
      reservation: reservationId,
    });

    if (exist) {
      return NextResponse.json({ message: "User already invited to this session" }, { status: 409 });
    }

    // 4. Create the invite with a 1-hour expiration (Requirement 2)
    const invite = await Invitation.create({
      sender: sender._id,
      receiver: receiver._id,
      reservation: reservationId,
      status: "pending",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Explicitly set 1 hour
    });

    return NextResponse.json({ message: "Invite sent successfully", invite }, { status: 201 });

  } catch (err: any) {
    console.error("INVITE_SEND_ERROR:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}