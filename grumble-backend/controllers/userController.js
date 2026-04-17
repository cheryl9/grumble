const userRepository = require("../repositories/userRepository");

/**
 * GET /api/users/:userId/profile
 * Return username and avatar for a user.
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await userRepository.getUserProfileById(userId);
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user profile" });
  }
};

module.exports = {
  getProfile,
};
