const orderModel = require("../models/order.model");

const createOrder = async (data) => {
  return orderModel.create(data);
};

const listOrders = async () => {
  return orderModel.find().populate("products").sort({ createdAt: -1 });
};

module.exports = { createOrder, listOrders };
