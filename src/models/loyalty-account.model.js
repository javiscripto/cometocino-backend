const mongoose = require("mongoose");

const loyaltyAccountSchema = new mongoose.Schema(
  {
    phoneNormalized: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    completedPurchases: { type: Number, default: 0, min: 0 },
    totalCompletedPurchases: { type: Number, default: 0, min: 0 },
    rewardAvailable: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
