const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const friendshipRepository = require("../repositories/friendshipRepository");

router.use(authMiddleware);

// GET /api/users/search?q=
// Search accepted friends by username for group creation.
router.get("/search", async (req, res) => {
  try {
    const userId = req.user.id;
    const q = (req.query.q || "").trim();

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const results = await friendshipRepository.searchAcceptedFriends(userId, q);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ success: false, message: "Failed to search users" });
  }
});

router.get("/:userId/profile", userController.getProfile);

module.exports = router;
