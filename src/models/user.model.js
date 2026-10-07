const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("User", userSchema);
