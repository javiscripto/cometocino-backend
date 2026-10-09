const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "El producto es obligatorio"],
    },
    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [1, "La cantidad debe ser al menos 1"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad debe ser un número entero",
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "El precio unitario no puede ser negativo"],
    },
  },
  { _id: false },
);

const ORDER_STATUSES = [
  "recibido",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
];

const ORDER_STATUS_LABELS = {
  recibido: "Pedido recibido",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

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
    products: {
      type: [orderProductSchema],
      required: [true, "El pedido debe incluir productos"],
      validate: {
        validator: (products) => products.length > 0,
        message: "El pedido debe incluir al menos un producto",
      },
    },
    total: {
      type: Number,
      required: true,
      min: [0, "El total no puede ser negativo"],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: "El estado '{VALUE}' no es válido",
      },
      default: "recibido",
      index: true,
    },
    address: {
      // agrega ubicacion con cordenadas obtenidas del navegador
      type: String,
      trim: true,
      maxlength: [120, "La dirección no puede superar 120 caracteres"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Las notas no pueden superar 1000 caracteres"],
    },
    orderNotes: {
      type: String,
      trim: true,
      maxlength: [120, "Las notas no pueden superar 120 caracteres"],
    },
  },
  { timestamps: true, versionKey: false },
);

orderSchema.pre("validate", function calculateTotal() {
  this.total = this.products.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
});

const Order = mongoose.model("Order", orderSchema);
Order.ORDER_STATUSES = ORDER_STATUSES;
Order.ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;

module.exports = Order;
