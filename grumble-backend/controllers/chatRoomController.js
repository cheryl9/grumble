const chatRoomRepository = require("../repositories/chatRoomRepository");
const friendsRepository = require("../repositories/friendsRepository");
const multer = require("multer");
const supabase = require("../config/supabase");
// (No realtime membership change notifications.)

//Need friendship repository to validate members when creating rooms

/**
 * Chat Room Controller
 * Handles HTTP requests for chat room operations
 */

/**
 * GET /api/chats - Get all chat rooms for current user
 */
const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await chatRoomRepository.getChatRoomsForUser(userId);

    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat rooms",
    });
  }
};
/**
 * POST /api/chats
 * Step 1 — Create the room shell (name + type)
 * Body: { type: 'direct'|'group', name?: string }
 */
const createChatRoom = async (req, res) => {
  try {
    const { type, name } = req.body;
    const userId = req.user.id;

    if (!type || !["direct", "group"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat type. Must be "direct" or "group"',
      });
    }

    if (type === "group" && !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group chats require a name",
      });
    }

    // Direct chats use getOrCreateDirectRoom later at member step
    // so we only create the shell for group chats here
    if (type === "direct") {
      return res.status(400).json({
        success: false,
        message:
          "For direct chats, use POST /api/chats/direct with a member_id",
      });
    }

    const room = await chatRoomRepository.createChatRoom(
      type,
      userId,
      name.trim(),
    );

    // Add creator as admin immediately
    await chatRoomRepository.addMemberToRoom(room.id, userId, "admin");

    res.status(201).json({
      success: true,
      data: room,
      message: "Chat room created. Add members to continue.",
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create chat room" });
  }
};

/**
 * POST /api/chats/direct
 * Create or retrieve a direct chat with one friend
 * Body: { member_id: number }
 */
const createDirectChat = async (req, res) => {
  try {
    const { member_id } = req.body;
    const userId = req.user.id;

    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: "member_id is required",
      });
    }

    // Validate friendship
    const areFriends = await friendsRepository.areFriends(userId, member_id);
    if (!areFriends) {
      return res.status(403).json({
        success: false,
        message: "You can only start a direct chat with a friend",
      });
    }

    const room = await chatRoomRepository.getOrCreateDirectRoom(
      userId,
      member_id,
    );
    const members = await chatRoomRepository.getChatRoomMembers(room.id);

    res.status(200).json({
      success: true,
      data: { ...room, members },
    });
  } catch (error) {
    console.error("Error creating direct chat:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create direct chat" });
  }
};

/**
 * POST /api/chats/:roomId/members
 * Step 2 — Add validated friends as members to a group room
 * Body: { user_ids: [number] }
 */
const addMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { user_ids } = req.body;
    const userId = req.user.id;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "user_ids must be a non-empty array",
      });
    }

    // Check room exists
    const room = await chatRoomRepository.getChatRoomById(roomId);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Chat room not found" });
    }

    // Only group chats can have members added this way
    if (room.type === "direct") {
      return res.status(400).json({
        success: false,
        message: "Cannot add members to a direct chat",
      });
    }

    // Check requester is admin
    const requesterRole = await chatRoomRepository.getMemberRole(
      roomId,
      userId,
    );
    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add members",
      });
    }

    // Validate all user_ids are accepted friends
    const friendIds = await friendsRepository.getFriendIds(userId);
    const friendIdSet = new Set(friendIds.map((id) => Number(id)));
    const nonFriends = user_ids
      .map((id) => Number(id))
      .filter((id) => !friendIdSet.has(id));

    if (nonFriends.length > 0) {
      return res.status(403).json({
        success: false,
        message: `These users are not your friends: ${nonFriends.join(", ")}`,
      });
    }

    // Add each validated member
    const added = [];
    const skipped = []; // already in room

    for (const memberId of user_ids) {
      const result = await chatRoomRepository.addMemberToRoom(
        roomId,
        memberId,
        "member",
      );
      if (result) {
        added.push(memberId);
      } else {
        skipped.push(memberId); // ON CONFLICT DO NOTHING returned nothing
      }
    }

    // No realtime notification for membership changes.

    const updatedMembers = await chatRoomRepository.getChatRoomMembers(roomId);

    res.status(201).json({
      success: true,
      data: updatedMembers,
      meta: { added: added.length, skipped: skipped.length },
      message: `Added ${added.length} member(s)${skipped.length > 0 ? `, ${skipped.length} already in room` : ""}`,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ success: false, message: "Failed to add members" });
  }
};

/**
 * GET /api/chats/:roomId - Get chat room details and members
 */
const getChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if user is member of the room
    const isMember = await chatRoomRepository.isMemberOfRoom(roomId, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat room",
      });
    }

    const room = await chatRoomRepository.getChatRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    const members = await chatRoomRepository.getChatRoomMembers(roomId);

    res.json({
      success: true,
      data: {
        ...room,
        members,
      },
    });
  } catch (error) {
    console.error("Error fetching chat room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat room",
    });
  }
};

const BUCKET = "group-avatars";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Images only"));
    }
    cb(null, true);
  },
});

// PATCH /api/chats/:roomId
// Handles name, avatar_url (text), or avatar file upload — all in one
const updateChatRoom = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const updates = { ...req.body };

      // If a file was uploaded, push it to Supabase Storage
      // and inject the resulting URL into updates before hitting the repository
      if (req.file) {
        const filePath = `groups/${roomId}/avatar`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        updates.avatar_url = data.publicUrl;
      }

      const updatedRoom = await chatRoomRepository.updateChatRoom(
        roomId,
        updates,
      );

      if (!updatedRoom) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      res.json(updatedRoom);
    } catch (error) {
      console.error("Failed to update chat room:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
];

/**
 * PATCH /api/chats/:roomId/members/:userId - Update a member role (admin/member)
 */
const updateMemberRole = async (req, res) => {
  try {
    const { roomId, userId: memberIdParam } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    const memberId = Number(memberIdParam);
    if (!Number.isInteger(memberId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be either "admin" or "member"',
      });
    }

    const room = await chatRoomRepository.getChatRoomById(roomId);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Chat room not found" });
    }

    if (room.type === "direct") {
      return res.status(400).json({
        success: false,
        message: "Cannot change roles in a direct chat",
      });
    }

    const requesterRole = await chatRoomRepository.getMemberRole(
      roomId,
      currentUserId,
    );
    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can change roles",
      });
    }

    const members = await chatRoomRepository.getChatRoomMembers(roomId);
    const targetMember = members.find(
      (m) => Number(m.user_id) === Number(memberId),
    );
    if (!targetMember) {
      return res
        .status(404)
        .json({ success: false, message: "User is not a member of this room" });
    }

    if (targetMember.role === "admin" && role === "member") {
      const admins = members.filter((m) => m.role === "admin");
      if (
        admins.length === 1 &&
        Number(admins[0].user_id) === Number(memberId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Room must have at least one admin",
        });
      }
    }

    await chatRoomRepository.updateMemberRole(roomId, memberId, role);
    const updatedMembers = await chatRoomRepository.getChatRoomMembers(roomId);

    return res.json({
      success: true,
      data: updatedMembers,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update member role",
    });
  }
};

/**
 * DELETE /api/chats/:roomId/members/:userId - Remove a member from chat room
 */
const removeMember = async (req, res) => {
  try {
    const { roomId, userId: memberIdParam } = req.params;
    const currentUserId = req.user.id;

    const memberId = Number(memberIdParam);
    if (!Number.isInteger(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const room = await chatRoomRepository.getChatRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Use the /leave endpoint for self-removal to keep semantics consistent.
    if (memberId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Use /api/chats/:roomId/leave to leave a room",
      });
    }

    const requesterRole = await chatRoomRepository.getMemberRole(
      roomId,
      currentUserId,
    );
    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove members",
      });
    }

    if (Number(room.created_by) === Number(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the room creator",
      });
    }

    const members = await chatRoomRepository.getChatRoomMembers(roomId);
    const target = members.find((m) => Number(m.user_id) === Number(memberId));
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this room",
      });
    }

    if (target.role === "admin") {
      const admins = members.filter((m) => m.role === "admin");
      if (admins.length === 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin",
        });
      }
    }

    await chatRoomRepository.removeMemberFromRoom(roomId, memberId);

    // No realtime notification for membership changes.

    const updatedMembers = await chatRoomRepository.getChatRoomMembers(roomId);

    res.json({
      success: true,
      data: updatedMembers,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};

/**
 * DELETE /api/chats/:roomId/leave - Current user leaves the chat room
 */
const leaveRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check membership
    const isMember = await chatRoomRepository.isMemberOfRoom(roomId, userId);
    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    // Last admin check
    const members = await chatRoomRepository.getChatRoomMembers(roomId);
    const admins = members.filter((m) => m.role === "admin");
    if (
      admins.length === 1 &&
      admins[0].user_id === userId &&
      members.length > 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Transfer admin role before leaving",
      });
    }

    await chatRoomRepository.removeMemberFromRoom(roomId, userId);

    res.json({
      success: true,
      message: "Left the chat room successfully",
    });
  } catch (error) {
    console.error("Error leaving chat room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave chat room",
    });
  }
};

module.exports = {
  getChatRooms,
  createChatRoom,
  createDirectChat,
  getChatRoom,
  updateChatRoom,
  addMembers,
  removeMember,
  updateMemberRole,
  leaveRoom,
};
