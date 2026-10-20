const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const Product = require("../models/product.model");
const { getStoreStatus } = require("./store-hours.service");
const loyaltyService = require("./loyalty.service");
const { normalizePhone } = require("../utils/phone");

const createOrder = async (data) => {
  const storeStatus = await getStoreStatus();
  if (!storeStatus.acceptingOrders) {
    const error = new Error(
      "Ahora estamos cerrados y no podemos recibir pedidos.",
    );
    error.status = 409;
    throw error;
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    const error = new Error("El pedido debe incluir al menos un producto");
    error.status = 400;
    throw error;
  }

  const productIds = data.products.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "_id salePrice",
  );
  const productById = new Map(products.map((product) => [product.id, product]));

  const orderProducts = data.products.map(({ productId, quantity }) => {
    const product = productById.get(String(productId));
    if (!product) {
      const error = new Error(`No se encontró el producto ${productId}`);
      error.status = 400;
      throw error;
    }

    return { productId: product.id, quantity, unitPrice: product.salePrice };
  });
  const order = await orderModel.create({
    clientName: data.clientName,
    phoneNumber: data.phoneNumber,
    phoneNormalized: normalizePhone(data.phoneNumber),
    address: data.address,
    notes: data.notes,
    status: "recibido",
    products: orderProducts,
  });
  return order.populate("products.productId", "name salePrice imageUrl");
};

const listOrders = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }

  return orderModel
    .find(query)
    .populate("products.productId", "name salePrice imageUrl")
    .sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return orderModel
    .findById(id)
    .populate("products.productId", "name salePrice imageUrl");
};

//eliminar order by id
const deleteOrderById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return orderModel.findByIdAndDelete(id);
};

const getOrderTracking = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const order = await orderModel
    .findById(id)
    .populate("products.productId", "name salePrice imageUrl");

  if (!order) return null;

  const status = order.status || "recibido";
  const loyalty = await loyaltyService.getProgress(
    order.phoneNormalized || order.phoneNumber,
  );
  return {
    id: order.id,
    status,
    statusLabel: orderModel.ORDER_STATUS_LABELS?.[status] || status,
    clientName: order.clientName,
    address: order.address,
    notes: order.notes,
    products: order.products,
    total: order.total,
    loyalty,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const updateOrderStatus = async (id, status, orderNotes) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  if (!orderModel.ORDER_STATUSES.includes(status)) {
    const error = new Error(
      `Estado '${status}' no es válido. Estados permitidos: ${orderModel.ORDER_STATUSES.join(", ")}`,
    );
    error.status = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  try {
    let updatedOrder = null;
    await session.withTransaction(async () => {
      const order = await orderModel.findById(id).session(session);
      if (!order) return;

      const confirmsPayment =
        order.status === "recibido" &&
        status === "en_preparacion" &&
        !order.loyaltyCountedAt;

      order.status = status;
      if (typeof orderNotes === "string") order.orderNotes = orderNotes;
      if (confirmsPayment) order.loyaltyCountedAt = new Date();
      await order.save({ session });

      if (confirmsPayment) {
        await loyaltyService.recordCompletedPurchase(
          order.phoneNormalized || order.phoneNumber,
          session,
        );
      }

      updatedOrder = order;
    });

    if (!updatedOrder) return null;
    return updatedOrder.populate("products.productId", "name salePrice imageUrl");
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  deleteOrderById,
  getOrderTracking,
  updateOrderStatus,
};
