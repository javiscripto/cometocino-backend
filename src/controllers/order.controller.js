const orderService = require("../services/order.service");
const { sendNotification } = require("../utils/ntfy");

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.body);
  await sendNotification(order.toObject());
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

// delete order
async function deleteOrder(req, res) {
  const order = await orderService.deleteOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  return res.status(204).send();
}

async function getOrderTracking(req, res) {
  res.set("Cache-Control", "no-store");
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

async function showOrdersPage(req, res) {
  const { status } = req.query;
  const filter = status && status !== "all" ? { status } : {};
  const orders = await orderService.listOrders(filter);
  const Order = require("../models/order.model");

  return res.render("orders/index", {
    orders,
    currentStatus: status || "all",
    statuses: Order.ORDER_STATUSES,
    statusLabels: Order.ORDER_STATUS_LABELS,
    updated: req.query.updated === "1",
    error: req.query.error || null,
  });
}

async function submitStatusUpdate(req, res) {
  try {
    const { status, orderNotes } = req.body;
    await orderService.updateOrderStatus(req.params.id, status, orderNotes);
    const redirectTo = req.query.from || "/admin/orders?updated=1";
    return res.redirect(303, redirectTo);
  } catch (error) {
    return res.redirect(
      303,
      "/admin/orders?error=" + encodeURIComponent(error.message),
    );
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  deleteOrder,
  getOrderTracking,
  updateOrderStatus,
  showOrdersPage,
  submitStatusUpdate,
};
