import mongoose, { Schema, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    sport: { type: String, required: true },
    hostName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    participants: { type: [String], default: [] }, // This stores the emails of confirmed people
    minParticipants: { type: Number, default: 2 },
    status: { 
      type: String, 
      enum: ["active", "cancelled"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

const Reservation = models.Reservation || mongoose.model("Reservation", ReservationSchema);
export default Reservation;