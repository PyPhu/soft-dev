import { createCoworkingReservation, getCoworkingReservations } from "./coworkspace";

export async function GET(req: Request) {
  return getCoworkingReservations(req);
}

export async function POST(req: Request) {
  return createCoworkingReservation(req);
}

