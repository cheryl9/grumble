const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { requirePollRoomMember } = require("../middleware/membershipGuard");
const pollController = require("../controllers/pollController");

router.use(authMiddleware);

router.get("/:pollId", requirePollRoomMember, pollController.getPoll);
router.post("/:pollId/vote", requirePollRoomMember, pollController.vote);
router.delete(
  "/:pollId/vote",
  requirePollRoomMember,
  pollController.removeVote,
);
router.get("/:pollId/votes", requirePollRoomMember, pollController.getVotes);

module.exports = router;
