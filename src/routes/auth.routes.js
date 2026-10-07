const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const requireAdmin = require("../middlewares/require-admin");

const router = Router();

router.post("/login", authController.loginApi);
router.get("/me", requireAdmin, authController.currentUser);

module.exports = router;
