const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const requireAdmin = require("../middlewares/require-admin");

const router = Router();

router
  .route("/")
  .get(requireAdmin, orderController.listOrders)
  .post(orderController.createOrder);

// Consulta pública de seguimiento para el cliente/frontend
router.get("/:id/tracking", orderController.getOrderTracking);
router.get("/:id/status", orderController.getOrderTracking);

// Consulta de pedido por ID y actualización de estado para admin
router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(requireAdmin, orderController.updateOrderStatus);

router.patch("/:id/status", requireAdmin, orderController.updateOrderStatus);

module.exports = router;
