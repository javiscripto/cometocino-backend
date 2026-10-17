const { Router } = require("express");
const storeController = require("../controllers/store.controller");
const requireAdmin = require("../middlewares/require-admin");

const router = Router();

router.get("/status", storeController.getStatus);
router.route("/hours").get(requireAdmin, storeController.getAdminHours).put(requireAdmin, storeController.updateAdminHours);

module.exports = router;
