const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const apiRoutes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/error-handler");
const productController = require("./controllers/product.controller");
const authController = require("./controllers/auth.controller");
const requireAdmin = require("./middlewares/require-admin");

const app = express();
//permitir cors desde cualquier origen
app.use(cors({ origin: "*" }));
//
// const configuredOrigins = (process.env.CORS_ORIGINS || "")
//   .split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);
// const localOriginPattern =
//   /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
//
// app.use(
//   cors({
//     origin(origin, callback) {
//       const isAllowed =
//         !origin ||
//         configuredOrigins.includes(origin) ||
//         (process.env.NODE_ENV !== "production" &&
//           localOriginPattern.test(origin));
//       callback(null, isAllowed);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     optionsSuccessStatus: 204,
//   }),
// );
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/api/v1", apiRoutes);
app.use("/api/v1/auth", authRoutes);
app.get("/admin/login", authController.showLogin);
app.post("/admin/login", authController.loginPage);
app.post("/admin/logout", authController.logout);
app.get("/admin/products/new", requireAdmin, productController.showCreateForm);
app.post("/admin/products", requireAdmin, productController.submitCreateForm);
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

module.exports = app;
