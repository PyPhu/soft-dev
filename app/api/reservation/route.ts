import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import {
  applyCancellationPenalty,
  applyMonthlyResetIfNeeded,
  formatBanEndDate,
  getBanValidation,
} from "@/lib/reservation-penalty";

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
      return NextResponse.json(
        { owned: [], received: [], isBanned: false, ban_until: null },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        owned: [],
        received: [],
        isBanned: false,
        ban_until: null,
      });
    }

    applyMonthlyResetIfNeeded(user);
    const { isBanned, banUntil } = getBanValidation(user);
    await user.save();

    const ownedReservations = await Reservation.find({
      $and: [
        { status: { $ne: "cancelled" } },
        {
          $or: [
            { hostEmail: user.email },
            { hostName: user.name },
          ],
        },
      ],
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
      isBanned,
      ban_until: banUntil,
      cancellation_count: user.cancellation_count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        owned: [],
        received: [],
        isBanned: false,
        ban_until: null,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { sport, date, timeSlot, hostEmail } = body;

    if (!hostEmail) {
      return NextResponse.json(
        { message: "Host email is required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: hostEmail });
    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 },
      );
    }

    applyMonthlyResetIfNeeded(user);
    const { isBanned, banUntil } = getBanValidation(user);
    await user.save();

    if (isBanned && banUntil) {
      return NextResponse.json(
        { message: `You cannot make a reservation until ${formatBanEndDate(banUntil)}.` },
        { status: 403 },
      );
    }

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
    const email = searchParams.get("email");

    if (!id)
      return NextResponse.json({ message: "ID required" }, { status: 400 });

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json({ message: "Reservation already cancelled" }, { status: 200 });
    }

    await Reservation.findByIdAndUpdate(id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
    await Invitation.deleteMany({ reservation: id });

    const user = await User.findOne(
      email
        ? { email }
        : reservation.hostEmail
          ? { email: reservation.hostEmail }
          : { name: reservation.hostName },
    );

    if (!user) {
      return NextResponse.json(
        { message: "Canceled, but penalty could not be applied because user was not found." },
        { status: 200 },
      );
    }

    const { cancellationCount, banUntil } = applyCancellationPenalty(user);
    await user.save();

    return NextResponse.json(
      {
        message: "Canceled",
        cancellation_count: cancellationCount,
        ban_until: banUntil,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
