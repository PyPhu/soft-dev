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
    const date = searchParams.get("date");
    const sport = searchParams.get("sport");

    //CASE 1: Fetch booked time slots

    if (date && sport) {
      const reservations = await Reservation.find({
        date,
        sport,
        status: { $ne: "cancelled" },
      }).select("timeSlot");

      return NextResponse.json({
        slots: reservations.map((r) => r.timeSlot),
      });
    }

    //CASE 2: Fetch user's reservations
    if (!email) {
      return NextResponse.json({ owned: [], received: [] }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ owned: [], received: [] });
    }

    const ownedReservations = await Reservation.find({
      hostName: user.name,
      status: { $ne: "cancelled" },
    }).lean();

    const ownedWithInvites = await Promise.all(
      ownedReservations.map(async (res: any) => {
        const invites = await Invitation.find({ reservation: res._id })
          .populate("receiver", "email")
          .lean();

        return {
          ...res,
          id: res._id.toString(),
          role: "host",
          invitationDetails: invites.map((i: any) => ({
            email: i.receiver?.email || "Unknown",
            status: i.status,
          })),
        };
      }),
    );

    const receivedInvites = await Invitation.find({
      receiver: user._id,
      status: "pending",
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
        role: "invitee",
      }));

    return NextResponse.json({
      owned: ownedWithInvites,
      received: invitations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { owned: [], received: [], error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { sport, date, timeSlot } = body;
    const existing = await Reservation.findOne({
      sport,
      date,
      timeSlot,
      status: { $ne: "cancelled" }, // ยังไม่ถูกยกเลิก
    });

    if (existing) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }, // Conflict
      );
    }

    const reservation = await Reservation.create({
      ...body,
      status: "active",
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error("POST_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- ADDED DELETE METHOD ---
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ message: "ID required" }, { status: 400 });

    await Reservation.findByIdAndUpdate(id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
    await Invitation.deleteMany({ reservation: id });

    return NextResponse.json({ message: "Canceled" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
