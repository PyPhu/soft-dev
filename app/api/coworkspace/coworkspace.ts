import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

type HubId = "HM" | "KLLC";

type SpaceConfig = {
  id: string;
  hub: HubId;
  name: string;
  location: string;
  totalUnits: number;
  unitLabel: string;
};

const spaceConfigs: SpaceConfig[] = [
  { id: "hm-private-room", hub: "HM", name: "Private Room", location: "HM", totalUnits: 2, unitLabel: "Room" },
  { id: "hm-605-table", hub: "HM", name: "Open Tables", location: "HM-605", totalUnits: 12, unitLabel: "Table" },
  { id: "hm-7f-table", hub: "HM", name: "Open Tables", location: "HM 7th Floor", totalUnits: 6, unitLabel: "Table" },
  { id: "kllc-meeting-room", hub: "KLLC", name: "Meeting Room", location: "KLLC", totalUnits: 2, unitLabel: "Room" },
  { id: "kllc-karaoke", hub: "KLLC", name: "Karaoke Room", location: "KLLC", totalUnits: 1, unitLabel: "Room" },
  { id: "kllc-game-room", hub: "KLLC", name: "Game Room", location: "KLLC", totalUnits: 1, unitLabel: "Room" },
];

type CreateCoworkingPayload = {
  hostName?: string;
  userName?: string;
  hub?: string;
  spaceId?: string;
  unitNumber?: number;
  date?: string;
  time?: string;
};

function parsePayload(body: unknown): CreateCoworkingPayload {
  if (!body || typeof body !== "object") return {};
  return body as CreateCoworkingPayload;
}

export async function createCoworkingReservation(req: Request) {
  try {
    await connectDB();
    const body = parsePayload(await req.json());

    const hostName = (body.hostName || "").trim();
    const hub = (body.hub || "").trim().toUpperCase();
    const spaceId = (body.spaceId || "").trim();
    const unitNumber = Number(body.unitNumber);
    const date = (body.date || "").trim();
    const time = (body.time || "").trim();

    if (!hostName || !hub || !spaceId || !Number.isInteger(unitNumber) || !date || !time) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const config = spaceConfigs.find((space) => space.id === spaceId && space.hub === hub);
    if (!config) {
      return NextResponse.json({ message: "Invalid coworking location/space." }, { status: 400 });
    }

    if (unitNumber < 1 || unitNumber > config.totalUnits) {
      return NextResponse.json({ message: `Unit must be between 1 and ${config.totalUnits}.` }, { status: 400 });
    }

    const conflict = await Reservation.findOne({
      type: "coworking",
      hub,
      spaceId,
      unitNumber,
      date,
      timeSlot: time,
      status: { $ne: "cancelled" },
    }).lean();

    if (conflict) {
      return NextResponse.json({ message: `${config.unitLabel} ${unitNumber} is already booked for this slot.` }, { status: 409 });
    }

    const reservation = await Reservation.create({
      type: "coworking",
      sport: "Co-Working",
      hostName,
      userName: body.userName || hostName,
      date,
      timeSlot: time,
      time,
      hub,
      facility: `${config.name} (${config.location})`,
      unit: `${config.unitLabel} ${unitNumber}`,
      spaceId,
      unitNumber,
      canteen: `${hub} - ${config.name}`,
      totalSeats: 1,
      reservations: [{ table: unitNumber, seats: [1] }],
      participants: [],
      minParticipants: 1,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("CREATE_COWORKSPACE_ERROR:", error);
    return NextResponse.json({ message: "Failed to create coworking reservation." }, { status: 500 });
  }
}

export async function getCoworkingReservations(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const hub = (searchParams.get("hub") || "").toUpperCase();
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const spaceId = searchParams.get("spaceId");

    const query: Record<string, unknown> = { type: "coworking" };

    if (hub) query.hub = hub;
    if (date) query.date = date;
    if (time) query.timeSlot = time;
    if (spaceId) query.spaceId = spaceId;

    const reservations = await Reservation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error) {
    console.error("GET_COWORKSPACE_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch coworking reservations." }, { status: 500 });
  }
}
