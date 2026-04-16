const express = require("express");
const router = express.Router();
const chatRoomController = require("../controllers/chatRoomController");
const chatMessageController = require("../controllers/chatMessageController");
const authMiddleware = require("../middleware/authMiddleware");

// All chat routes require authentication
router.use(authMiddleware);

/**
 * Chat Room Routes
 */

// Get all chat rooms for current user
router.get("/", chatRoomController.getChatRooms);

// Create a new chat room
router.post("/", chatRoomController.createChatRoom);

// Create or retrieve a direct chat
router.post("/direct", chatRoomController.createDirectChat);

// Get specific chat room details
router.get("/:roomId", chatRoomController.getChatRoom);

// Update chat room (name, avatar)
router.patch("/:roomId", chatRoomController.updateChatRoom);

// Add members to a chat room
router.post("/:roomId/members", chatRoomController.addMembers);

// Remove a member from a chat room
router.delete("/:roomId/members/:userId", chatRoomController.removeMember);

// Current user leaves a chat room
router.delete("/:roomId/leave", chatRoomController.leaveRoom);

/**
 * Chat Messages Routes
 */

// Get messages for a chat room (paginated)
router.get("/:roomId/messages", chatMessageController.getMessages);

// Send a message to a chat room
router.post("/:roomId/messages", chatMessageController.sendMessage);

// Delete a message
router.delete("/messages/:messageId", chatMessageController.deleteMessage);

module.exports = router;
