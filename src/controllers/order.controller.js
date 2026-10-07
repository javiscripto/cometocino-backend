const orderService = require("../services/order.service");
const { sendNotification } = require("../utils/ntfy");

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.body);
  await sendNotification();
  return res.status(201).json({ data: order });
}

async function listOrders(req, res) {
  const orders = await orderService.listOrders();
  return res.json({ data: orders });
}

module.exports = { createOrder, listOrders };
