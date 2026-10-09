const orderService = require("../services/order.service");
const { sendNotification } = require("../utils/ntfy");

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.body);
  console.log(order);
  await sendNotification(req.body);
  return res.status(201).json({ data: order });
}

async function listOrders(req, res) {
  const orders = await orderService.listOrders(req.query);
  return res.json({ data: orders });
}

async function getOrder(req, res) {
  const order = await orderService.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  return res.json({ data: order });
}

async function getOrderTracking(req, res) {
  const tracking = await orderService.getOrderTracking(req.params.id);
  if (!tracking) return res.status(404).json({ error: "Pedido no encontrado" });
  return res.json({ data: tracking });
}

async function updateOrderStatus(req, res) {
  const { status, orderNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: "El campo status es obligatorio" });
  }

  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    orderNotes,
  );
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  return res.json({ data: order });
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  getOrderTracking,
  updateOrderStatus,
};
