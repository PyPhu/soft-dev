import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    image: String,
    dob: {
      type: Date, 
    },
    address: {
      type: String,
    },
    phoneNumber: {
      type: String, 
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      default: "prefer-not-to-say"
    }
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
