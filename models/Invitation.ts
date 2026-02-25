import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    // Requirement 2: 1-hour expiration
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
  },
  { timestamps: true }
);

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);