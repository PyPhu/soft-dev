import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { invitationId, response } = await req.json(); // response: 'accepted' | 'declined'

    const invite = await Invitation.findById(invitationId);
    if (!invite || new Date() > invite.expiresAt) {
      return NextResponse.json({ message: "Invitation expired or not found" }, { status: 410 });
    }

    invite.status = response;
    await invite.save();

    // Requirement 6: If > 50% decline, cancel booking
    if (response === "declined") {
      const allInvites = await Invitation.find({ reservation: invite.reservation });
      const declinedCount = allInvites.filter(i => i.status === "declined").length;
      
      if (declinedCount > allInvites.length / 2) {
        await Reservation.findByIdAndUpdate(invite.reservation, { status: "cancelled" });
      }
    }

    return NextResponse.json({ message: "Response recorded" });
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}