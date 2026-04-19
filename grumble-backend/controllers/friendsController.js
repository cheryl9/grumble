const friendsRepo = require("../repositories/friendsRepository");
const achievementService = require("../services/achievementService");
const pool = require("../config/db");
const { sendNotificationAlert } = require("../services/realtime");
const notificationsRepo = require("../repositories/notificationsRepository");

async function checkAndNotifyFriendshipAchievements(userId) {
  const newlyUnlocked = await achievementService.checkAndUnlockAchievements(
    userId,
    pool,
  );

  if (newlyUnlocked.length > 0) {
    sendNotificationAlert(userId, {
      type: "achievement_unlocked",
      achievementKeys: newlyUnlocked,
      unlockedAt: new Date().toISOString(),
    });
  }
}

async function saveFriendAcceptanceNotification(receiverId, accepterUsername, friendshipId, accepterId) {
  await notificationsRepo.createNotification(receiverId, {
    type: "friend_request_accepted",
    title: `${accepterUsername} accepted your friend request!`,
    body: "You can start chatting or check the friends page.",
    payload: {
      accepterId,
      accepterUsername,
      friendshipId,
    },
  });
}

const normalizeAcceptedFriend = (row) => {
  // Preserve existing fields used by FriendsList/AddFriendSearch,
  // while also exposing chat-friendly aliases expected by CreateGroupModal.
  const id = row.friend_user_id;
  const username = row.friend_username;
  const avatar_url = row.friend_avatar_url ?? null;
  const equipped_avatar = row.friend_equipped_avatar ?? null;

  return {
    ...row,
    id,
    username,
    avatar_url,
    equipped_avatar,
  };
};

async function sendRequest(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    const numericFriendId = Number(friendId);

    if (!friendId) {
      return res.status(400).json({ error: "friendId is required" });
    }

    if (!Number.isInteger(numericFriendId)) {
      return res.status(400).json({ error: "friendId must be an integer" });
    }

    if (numericFriendId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot send a friend request to yourself" });
    }

    const result = await friendsRepo.sendFriendRequest(userId, numericFriendId);

    if (result.alreadyFriends) {
      return res
        .status(400)
        .json({ error: "You are already friends with this user" });
    }
    if (result.alreadyPending) {
      return res.status(400).json({ error: "Friend request already sent" });
    }
    if (result.autoAccepted) {
      const firstUserId = Number(result.friendship?.user_id);
      const secondUserId = Number(result.friendship?.friend_id);

      sendNotificationAlert(firstUserId, {
        type: "friend_request_accepted",
        accepterId: secondUserId,
        accepterUsername: req.user.username,
        friendshipId: result.friendship?.id ?? null,
        acceptedAt: new Date().toISOString(),
      });

      await saveFriendAcceptanceNotification(
        firstUserId,
        req.user.username,
        result.friendship?.id ?? null,
        secondUserId,
      );

      await Promise.all([
        Number.isInteger(firstUserId)
          ? checkAndNotifyFriendshipAchievements(firstUserId)
          : Promise.resolve(),
        Number.isInteger(secondUserId)
          ? checkAndNotifyFriendshipAchievements(secondUserId)
          : Promise.resolve(),
      ]);

      return res.status(200).json({
        message: "Friend request auto-accepted — you are now friends!",
        friendship: result.friendship,
        autoAccepted: true,
      });
    }

    res.status(201).json({
      message: "Friend request sent",
      friendship: result.friendship,
    });

    sendNotificationAlert(numericFriendId, {
      type: "friend_request_received",
      requesterId: userId,
      requesterUsername: req.user.username,
      friendshipId: result.friendship?.id ?? null,
      requestedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ error: "Failed to send friend request" });
  }
}

async function acceptRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const friendship = await friendsRepo.acceptFriendRequest(requestId, userId);
    if (!friendship) {
      return res
        .status(404)
        .json({ error: "Friend request not found or already handled" });
    }

    const firstUserId = Number(friendship.user_id);
    const secondUserId = Number(friendship.friend_id);

    sendNotificationAlert(firstUserId, {
      type: "friend_request_accepted",
      accepterId: secondUserId,
      accepterUsername: req.user.username,
      friendshipId: friendship.id ?? null,
      acceptedAt: new Date().toISOString(),
    });

    await saveFriendAcceptanceNotification(
      firstUserId,
      req.user.username,
      friendship.id ?? null,
      secondUserId,
    );

    await Promise.all([
      Number.isInteger(firstUserId)
        ? checkAndNotifyFriendshipAchievements(firstUserId)
        : Promise.resolve(),
      Number.isInteger(secondUserId)
        ? checkAndNotifyFriendshipAchievements(secondUserId)
        : Promise.resolve(),
    ]);

    res.json({ message: "Friend request accepted", friendship });
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
}

async function declineRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const deleted = await friendsRepo.declineFriendRequest(requestId, userId);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Friend request not found or already handled" });
    }

    res.json({ message: "Friend request declined" });
  } catch (err) {
    console.error("declineRequest error:", err);
    res.status(500).json({ error: "Failed to decline friend request" });
  }
}

async function removeFriend(req, res) {
  try {
    const userId = req.user.id;
    const friendshipId = parseInt(req.params.id);

    const deleted = await friendsRepo.removeFriend(friendshipId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    res.json({ message: "Friend removed" });
  } catch (err) {
    console.error("removeFriend error:", err);
    res.status(500).json({ error: "Failed to remove friend" });
  }
}

async function listFriends(req, res) {
  try {
    const userId = req.user.id;
    const friends = await friendsRepo.getFriends(userId);
    const data = friends.map(normalizeAcceptedFriend);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    console.error("listFriends error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch friends list" });
  }
}

async function listRequests(req, res) {
  try {
    const userId = req.user.id;
    const requests = await friendsRepo.getPendingRequests(userId);
    res.json(requests);
  } catch (err) {
    console.error("listRequests error:", err);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
}

async function listSentRequests(req, res) {
  try {
    const userId = req.user.id;
    const sent = await friendsRepo.getSentRequests(userId);
    res.json(sent);
  } catch (err) {
    console.error("listSentRequests error:", err);
    res.status(500).json({ error: "Failed to fetch sent requests" });
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
    console.error("searchUsers error:", err);
    res.status(500).json({ error: "Failed to search users" });
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
