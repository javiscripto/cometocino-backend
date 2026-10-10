const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre no puede superar 80 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede superar 1000 caracteres"],
      default: "",
    },
    salePrice: {
      type: Number,
      required: [true, "El precio de venta es obligatorio"],
      min: [0, "El precio de venta no puede ser negativo"],
    },
    productionCost: {
      type: Number,
      required: [true, "El costo de producción es obligatorio"],
      min: [0, "El costo de producción no puede ser negativo"],
    },
    active: { type: Boolean, default: true },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "La URL de imagen es demasiado larga"],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Product", productSchema);
