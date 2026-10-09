const { Router } = require("express");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const storeRoutes = require("./store.routes");
const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
router.use("/products", productRoutes);
router.use("/store", storeRoutes);
router.use("/order", orderRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
