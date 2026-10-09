const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const Product = require("../models/product.model");

const createOrder = async (data) => {
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

const getOrderTracking = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const order = await orderModel
    .findById(id)
    .populate("products.productId", "name salePrice imageUrl");

  if (!order) return null;

  const status = order.status || "recibido";
  return {
    id: order.id,
    status,
    statusLabel: orderModel.ORDER_STATUS_LABELS?.[status] || status,
    clientName: order.clientName,
    address: order.address,
    notes: order.notes,
    products: order.products,
    total: order.total,
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

  const updateData = { status };
  if (typeof orderNotes === "string") {
    updateData.orderNotes = orderNotes;
  }

  return orderModel
    .findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
    .populate("products.productId", "name salePrice imageUrl");
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
};
