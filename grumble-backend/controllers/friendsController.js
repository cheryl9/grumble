const friendsRepo = require('../repositories/friendsRepository');

async function sendRequest(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'friendId is required' });
    }

    if (friendId === userId) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
    }

    const result = await friendsRepo.sendFriendRequest(userId, friendId);

    if (result.alreadyFriends) {
      return res.status(400).json({ error: 'You are already friends with this user' });
    }
    if (result.alreadyPending) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }
    if (result.autoAccepted) {
      return res.status(200).json({
        message: 'Friend request auto-accepted — you are now friends!',
        friendship: result.friendship,
        autoAccepted: true,
      });
    }

    res.status(201).json({
      message: 'Friend request sent',
      friendship: result.friendship,
    });
  } catch (err) {
    console.error('sendRequest error:', err);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
}

async function acceptRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const friendship = await friendsRepo.acceptFriendRequest(requestId, userId);
    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found or already handled' });
    }

    res.json({ message: 'Friend request accepted', friendship });
  } catch (err) {
    console.error('acceptRequest error:', err);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
}

async function declineRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const deleted = await friendsRepo.declineFriendRequest(requestId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Friend request not found or already handled' });
    }

    res.json({ message: 'Friend request declined' });
  } catch (err) {
    console.error('declineRequest error:', err);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
}

async function removeFriend(req, res) {
  try {
    const userId = req.user.id;
    const friendshipId = parseInt(req.params.id);

    const deleted = await friendsRepo.removeFriend(friendshipId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed' });
  } catch (err) {
    console.error('removeFriend error:', err);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
}

async function listFriends(req, res) {
  try {
    const userId = req.user.id;
    const friends = await friendsRepo.getFriends(userId);
    res.json(friends);
  } catch (err) {
    console.error('listFriends error:', err);
    res.status(500).json({ error: 'Failed to fetch friends list' });
  }
}

async function listRequests(req, res) {
  try {
    const userId = req.user.id;
    const requests = await friendsRepo.getPendingRequests(userId);
    res.json(requests);
  } catch (err) {
    console.error('listRequests error:', err);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

async function listSentRequests(req, res) {
  try {
    const userId = req.user.id;
    const sent = await friendsRepo.getSentRequests(userId);
    res.json(sent);
  } catch (err) {
    console.error('listSentRequests error:', err);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
}

async function searchUsers(req, res) {
  try {
    const userId = req.user.id;
    const { username } = req.query;

    if (!username || !username.trim()) {
      return res.json([]);
    }

    const users = await friendsRepo.searchUsers(username.trim(), userId);
    res.json(users);
  } catch (err) {
    console.error('searchUsers error:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
}

module.exports = {
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriend,
  listFriends,
  listRequests,
  listSentRequests,
  searchUsers,
};
