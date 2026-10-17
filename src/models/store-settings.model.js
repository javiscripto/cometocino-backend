const mongoose = require("mongoose");

const intervalSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      required: [true, "La hora de apertura es obligatoria"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora de apertura no es válida"],
    },
    close: {
      type: String,
      required: [true, "La hora de cierre es obligatoria"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora de cierre no es válida"],
    },
  },
  { _id: false },
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    intervals: { type: [intervalSchema], default: [] },
  },
  { _id: false },
);

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    weeklyHours: {
      type: [dayScheduleSchema],
      required: true,
      validate: {
        validator: (days) => days.length === 7,
        message: "Debe configurarse el horario de los siete días",
      },
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
