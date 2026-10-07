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
    products: orderProducts,
  });
  return order.populate("products.productId", "name salePrice imageUrl");
};

const listOrders = async () => {
  return orderModel
    .find()
    .populate("products.productId", "name salePrice imageUrl")
    .sort({ createdAt: -1 });
};

module.exports = { createOrder, listOrders };
