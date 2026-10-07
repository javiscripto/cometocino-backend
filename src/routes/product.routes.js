const { Router } = require("express");
const productController = require("../controllers/product.controller");
const requireAdmin = require("../middlewares/require-admin");

const router = Router();

router
  .route("/")
  .get(productController.listProducts)
  .post(requireAdmin, productController.createProduct);
router
  .route("/:id")
  .get(productController.getProduct)
  .put(requireAdmin, productController.updateProduct)
  .delete(requireAdmin, productController.deleteProduct);

module.exports = router;
