const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const notificationsController = require("../controllers/notificationsController");

router.use(authMiddleware);

router.get("/unread", notificationsController.getUnreadNotifications);

module.exports = router;