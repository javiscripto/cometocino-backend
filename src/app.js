const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const apiRoutes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/error-handler");
const productController = require("./controllers/product.controller");
const orderController = require("./controllers/order.controller");
const authController = require("./controllers/auth.controller");
const requireAdmin = require("./middlewares/require-admin");

const app = express();
app.use(
  cors({
    origin: "https://frontend-cometocino.vercel.app/",
  }),
);
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const publicDirectory = path.join(__dirname, "..", "public");
app.use("/public", express.static(publicDirectory));
app.use(express.static(publicDirectory));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/api/v1", apiRoutes);
app.use("/api/v1/auth", authRoutes);
app.get("/admin", requireAdmin, (req, res) =>
  res.redirect(303, "/admin/orders"),
);
app.get("/", (req, res) => res.redirect("/admin/login"));
app.get("/admin/login", authController.showLogin);
app.post("/admin/login", authController.loginPage);
app.post("/admin/logout", authController.logout);

app.get("/admin/orders", requireAdmin, orderController.showOrdersPage);
app.post(
  "/admin/orders/:id/status",
  requireAdmin,
  orderController.submitStatusUpdate,
);

app.get("/admin/products", requireAdmin, productController.showCreateForm);
app.get("/admin/products/new", requireAdmin, productController.showCreateForm);
app.post("/admin/products", requireAdmin, productController.submitCreateForm);
app.get(
  "/admin/products/:id/edit",
  requireAdmin,
  productController.showEditForm,
);
app.get(
  "/admin/products/:id/update",
  requireAdmin,
  productController.showEditForm,
);
app.post(
  "/admin/products/:id/update",
  requireAdmin,
  productController.submitUpdateForm,
);
app.post(
  "/admin/products/:id/edit",
  requireAdmin,
  productController.submitUpdateForm,
);
app.post(
  "/admin/products/:id",
  requireAdmin,
  productController.submitUpdateForm,
);
app.post(
  "/admin/products/:id/delete",
  requireAdmin,
  productController.submitDeleteProduct,
);
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

module.exports = app;
