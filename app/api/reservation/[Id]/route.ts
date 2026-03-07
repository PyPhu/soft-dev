import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { applyCancellationPenalty } from "@/lib/reservation-penalty";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ Id: string }> },
) {
  try {
    const { Id } = await context.params;
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const reservation = await Reservation.findById(Id);
    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 },
      );
    }

    if (reservation.status !== "cancelled") {
      await Reservation.findByIdAndUpdate(Id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      await Invitation.deleteMany({ reservation: Id });
    }

    const user = await User.findOne(
      email
        ? { email }
        : reservation.hostEmail
          ? { email: reservation.hostEmail }
          : { name: reservation.hostName },
    );

    if (!user) {
      return NextResponse.json({ message: "Canceled, but user not found for penalty update." });
    }

    const { cancellationCount, banUntil } = applyCancellationPenalty(user);
    await user.save();

    return NextResponse.json({
      message: "Canceled successfully",
      cancellation_count: cancellationCount,
      ban_until: banUntil,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 },
    );
  }
}
