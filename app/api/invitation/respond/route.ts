import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";
import { sendAcceptanceEmail, sendDeclineEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { invitationId, response } = await req.json(); // response: 'accepted' | 'declined'

    // 1. Find and populate all necessary data for emails and participant updates
    const invite = await Invitation.findById(invitationId)
      .populate("receiver", "name")   // For participant list and email name
      .populate("sender", "email")     // For host notification email
      .populate("reservation");        // For sport details

    if (!invite) {
      return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
    }

    // 2. Security Check: Prevent responding to expired invites
    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ message: "Invitation has expired" }, { status: 410 });
    }

    // 3. Update the Invitation status
    invite.status = response;
    await invite.save();

    const sportName = invite.reservation?.sport || "Sports Session";
    const hostEmail = invite.sender?.email;
    const participantName = invite.receiver?.name;

    // 4. Handle ACCEPTED logic
    if (response === "accepted") {
      // Sync participant name to the main reservation list
      await Reservation.findByIdAndUpdate(invite.reservation._id, {
        $addToSet: { participants: participantName }
      });

      // Notify the Host via Resend
      if (hostEmail) {
        await sendAcceptanceEmail(hostEmail, participantName, sportName);
      }
    }

    // 5. Handle DECLINED logic
    if (response === "declined") {
      // Notify the Host via Resend
      if (hostEmail) {
        await sendDeclineEmail(hostEmail, participantName, sportName);
      }

      // Check the 50% decline rule (Requirement 6)
      const allInvites = await Invitation.find({ reservation: invite.reservation._id });
      const declinedCount = allInvites.filter(i => i.status === "declined").length;
      
      // If more than half the invited people decline, cancel the whole session
      if (declinedCount > allInvites.length / 2) {
        await Reservation.findByIdAndUpdate(invite.reservation._id, { status: "cancelled" });
      }
    }

    return NextResponse.json({ 
      message: `Successfully ${response}`, 
      newStatus: response 
    });

  } catch (err: any) {
    console.error("RESPOND_API_ERROR:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}