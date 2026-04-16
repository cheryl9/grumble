const chatMessageRepository = require('../repositories/chatMessageRepository');
const chatRoomRepository = require('../repositories/chatRoomRepository');
const foodPlaceRepository = require('../repositories/foodPlaceRepository');
const telegramService = require('../services/telegramService');
const {
  broadcastRoomEvent,
  sendNotificationAlert,
  isUserConnected,
  isUserActiveInRoom,
} = require('../services/realtime');

/**
 * Chat Messages Controller
 * Handles HTTP requests for sending and managing chat messages
 */

/**
 * GET /api/chats/:roomId/messages - Get paginated messages for a chat room
 * Query params: limit (default 50), offset (default 0)
 */
const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Check if user is member of the room
    const isMember = await chatRoomRepository.isMemberOfRoom(roomId, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this chat room'
      });
    }

    const messages = await chatMessageRepository.getMessagesForRoom(
      roomId,
      parseInt(limit),
      parseInt(offset)
    );

    // Enrich messages with complete data (including reactions, poll options, etc.)
    const enrichedMessages = await Promise.all(
      messages.map(msg => chatMessageRepository.getCompleteMessage(msg.id))
    );

    res.json({
      success: true,
      data: enrichedMessages,
      count: enrichedMessages.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

/**
 * POST /api/chats/:roomId/messages - Send a message
 * Body: {
 *   type: 'text'|'food_suggestion'|'poll'|'spin_wheel',
 *   content: {...},
 *   reply_to_message_id?: number
 * }
 */
const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { type, content, reply_to_message_id } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Message type and content are required'
      });
    }

    const validTypes = ['text', 'food_suggestion', 'poll', 'spin_wheel'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid message type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Check if user is member of the room
    const isMember = await chatRoomRepository.isMemberOfRoom(roomId, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this chat room'
      });
    }

    let replyToMessageId = null;
    if (reply_to_message_id !== undefined && reply_to_message_id !== null) {
      const parsed = Number(reply_to_message_id);
      if (!Number.isInteger(parsed)) {
        return res.status(400).json({
          success: false,
          message: 'reply_to_message_id must be an integer'
        });
      }

      const target = await chatMessageRepository.getMessageById(parsed);
      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Reply target message not found'
        });
      }

      if (Number(target.room_id) !== Number(roomId)) {
        return res.status(400).json({
          success: false,
          message: 'Reply target must be in the same room'
        });
      }

      replyToMessageId = parsed;
    }

    let message;

    if (type === 'text') {
      if (!content.text) {
        return res.status(400).json({
          success: false,
          message: 'Text content required for text messages'
        });
      }
      message = await chatMessageRepository.createTextMessage(
        roomId,
        userId,
        content,
        replyToMessageId
      );
    } else if (type === 'food_suggestion') {
      if (!content.food_place_id) {
        return res.status(400).json({
          success: false,
          message: 'food_place_id required for food suggestions'
        });
      }

      // Verify food place exists
      const foodPlace = await foodPlaceRepository.getFoodPlaceById(content.food_place_id);
      if (!foodPlace) {
        return res.status(404).json({
          success: false,
          message: 'Food place not found'
        });
      }

      message = await chatMessageRepository.createFoodSuggestionMessage(
        roomId,
        userId,
        content.food_place_id,
        replyToMessageId
      );
    } else if (type === 'poll') {
      if (!content.question || !content.options || !Array.isArray(content.options)) {
        return res.status(400).json({
          success: false,
          message: 'Poll requires question and options array'
        });
      }

      if (content.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Poll must have at least 2 options'
        });
      }

      message = await chatMessageRepository.createPollMessage(
        roomId,
        userId,
        content.question,
        content.options,
        replyToMessageId
      );
    } else if (type === 'spin_wheel') {
      if (!content.options || !Array.isArray(content.options) || content.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Spin wheel requires at least 2 options'
        });
      }

      message = await chatMessageRepository.createSpinWheelMessage(
        roomId,
        userId,
        content.options,
        replyToMessageId
      );
    }

    // Fetch complete message with enriched data
    const completeMessage = await chatMessageRepository.getCompleteMessage(message.id);

    broadcastRoomEvent(roomId, 'new_message', { message: completeMessage });

    // Dual-channel notifications:
    // - In-app: connected users who are NOT actively subscribed to this room
    // - Telegram: room members who are offline (no active socket connections)
    try {
      const numericRoomId = Number(roomId);
      const room = await chatRoomRepository.getChatRoomById(roomId);

      const preview = (() => {
        if (completeMessage?.type === 'text') return completeMessage.payload?.text || 'New message';
        if (completeMessage?.type === 'poll') {
          return completeMessage.payload?.question
            ? `Poll: ${completeMessage.payload.question}`
            : 'Poll';
        }
        if (completeMessage?.type === 'food_suggestion') {
          const placeName = completeMessage.payload?.food_place?.name;
          return placeName ? `Food suggestion: ${placeName}` : 'Food suggestion';
        }
        if (completeMessage?.type === 'spin_wheel') return 'Spin wheel';
        return 'New message';
      })();

      const chatName =
        room?.type === 'direct' ? (room?.name || 'Direct chat') : (room?.name || 'Chat');

      const targets = await chatRoomRepository.getChatRoomNotificationTargets(roomId);
      for (const t of targets) {
        if (t.user_id === userId) continue;

        if (isUserConnected(t.user_id)) {
          if (!isUserActiveInRoom(numericRoomId, t.user_id)) {
            sendNotificationAlert(t.user_id, {
              room_id: numericRoomId,
              room: room
                ? { id: room.id, type: room.type, name: room.name, avatar_url: room.avatar_url }
                : { id: numericRoomId },
              message: completeMessage,
              preview,
            });
          }
          continue;
        }

        if (t.telegram_chat_id) {
          void telegramService
            .sendChatNotification(t.telegram_chat_id, {
              senderName: completeMessage.sender?.username || 'Someone',
              message: preview,
              chatName,
            })
            .catch((err) => {
              console.error('Telegram notification failed:', err.message);
            });
        }
      }
    } catch (notifyErr) {
      console.error('Notification dispatch failed:', notifyErr);
    }

    res.status(201).json({
      success: true,
      data: completeMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * DELETE /api/messages/:messageId - Soft delete a message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Get the message
    const message = await chatMessageRepository.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Membership verification (required for message operations)
    const isMember = await chatRoomRepository.isMemberOfRoom(message.room_id, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this chat room'
      });
    }

    // Check if user is the sender or an admin of the room
    if (message.sender_id !== userId) {
      const members = await chatRoomRepository.getChatRoomMembers(message.room_id);
      const userMember = members.find(m => m.user_id === userId);

      if (!userMember || userMember.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own messages'
        });
      }
    }

    await chatMessageRepository.deleteMessage(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage
};
