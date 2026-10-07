const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const requireAdmin = require("../middlewares/require-admin");

const router = Router();

router
  .route("/")
  .get(requireAdmin, orderController.listOrders)
  .post(orderController.createOrder);

module.exports = router;
