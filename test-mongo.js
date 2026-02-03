require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

console.log("MONGODB_URI =", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
