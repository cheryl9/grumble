const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { requireSpinSessionRoomMember } = require("../middleware/membershipGuard");
const spinWheelController = require("../controllers/spinWheelController");

router.use(authMiddleware);

router.post(
  "/:sessionId/spin",
  requireSpinSessionRoomMember,
  spinWheelController.spin,
);
router.get("/:sessionId", requireSpinSessionRoomMember, spinWheelController.getSession);

module.exports = router;
