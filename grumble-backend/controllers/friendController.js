const friendshipRepository = require('../repositories/friendshipRepository');

/**
 * GET /api/friends
 * Return accepted friends (id, username, avatar_url).
 */
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await friendshipRepository.getAcceptedFriendsWithProfiles(userId);
    res.json({ success: true, data: friends, count: friends.length });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch friends' });
  }
};

module.exports = {
  getFriends
};
