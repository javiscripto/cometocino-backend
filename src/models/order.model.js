const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [120, "El nombre no puede superar 120 caracteres"],
    },
    phoneNumber: {
      type: String,
      required: [true, "el numero es obligatorio"],
      trim: true,
      maxlength: [12, "el numero no puede superar 12 caracteres"],
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    address: {
      // agrega ubicacion con cordenadas obtenidas del navegador
      type: String,
      trim: true,
      maxlength: [120, "La dirección no puede superar 120 caracteres"],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Order", orderSchema);
