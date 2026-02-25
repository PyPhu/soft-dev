import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ owned: [], received: [] }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ owned: [], received: [] });

    // 1. Get reservations where user is Host
    const ownedReservations = await Reservation.find({ hostName: user.name }).lean();
    
    const ownedWithInvites = await Promise.all(ownedReservations.map(async (res: any) => {
      const invites = await Invitation.find({ reservation: res._id })
        .populate("receiver", "email")
        .lean();

      return {
        ...res,
        id: res._id.toString(),
        role: "host",
        invitationDetails: invites.map((i: any) => ({
          email: i.receiver?.email || "Unknown",
          status: i.status
        }))
      };
    }));

    // 2. Get invitations sent TO user
    const receivedInvites = await Invitation.find({ 
      receiver: user._id, 
      status: "pending" 
    })
    .populate("sender", "name")
    .populate("reservation")
    .lean();

    const invitations = receivedInvites
      .filter((inv: any) => inv.reservation && inv.sender) 
      .map((inv: any) => ({
        ...inv.reservation,
        id: inv.reservation._id.toString(),
        invitationId: inv._id.toString(),
        senderName: inv.sender.name, 
        expiresAt: inv.expiresAt,
        role: "invitee"
      }));

    return NextResponse.json({ owned: ownedWithInvites, received: invitations });
  } catch (error: any) {
    return NextResponse.json({ owned: [], received: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Explicitly saves to 'reservations' collection in Atlas
    const reservation = await Reservation.create(body);
    
    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error("POST_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}