const chatRoomRepository = require("../repositories/chatRoomRepository");
const pollRepository = require("../repositories/pollRepository");
const spinWheelRepository = require("../repositories/spinWheelRepository");
const foodSuggestionRepository = require("../repositories/foodSuggestionRepository");
const chatMessageRepository = require("../repositories/chatMessageRepository");

const requireRoomMember = (roomIdParam = "roomId") => {
  return async (req, res, next) => {
    try {
      const roomId = Number(req.params?.[roomIdParam]);
      if (!Number.isInteger(roomId)) {
        return res
          .status(400)
          .json({
            success: false,
            message: `${roomIdParam} must be an integer`,
          });
      }

      const isMember = await chatRoomRepository.isMemberOfRoom(
        roomId,
        req.user.id,
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this chat room",
        });
      }

      req.roomId = roomId;
      next();
    } catch (err) {
      next(err);
    }
  };
};

const requirePollRoomMember = async (req, res, next) => {
  try {
    const pollId = Number(req.params?.pollId);
    if (!Number.isInteger(pollId)) {
      return res
        .status(400)
        .json({ success: false, message: "pollId must be an integer" });
    }

    const poll = await pollRepository.getPollById(pollId);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    const isMember = await chatRoomRepository.isMemberOfRoom(
      poll.room_id,
      req.user.id,
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat room",
      });
    }

    req.poll = poll;
    next();
  } catch (err) {
    next(err);
  }
};

const requireSpinSessionRoomMember = async (req, res, next) => {
  try {
    const sessionId = Number(req.params?.sessionId);
    if (!Number.isInteger(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId must be an integer" });
    }

    const session = await spinWheelRepository.getSessionById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Spin wheel session not found" });
    }

    const isMember = await chatRoomRepository.isMemberOfRoom(
      session.room_id,
      req.user.id,
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat room",
      });
    }

    req.spinSession = session;
    next();
  } catch (err) {
    next(err);
  }
};

const requireSuggestionRoomMember = async (req, res, next) => {
  try {
    const suggestionId = Number(req.params?.suggestionId);
    if (!Number.isInteger(suggestionId)) {
      return res
        .status(400)
        .json({ success: false, message: "suggestionId must be an integer" });
    }

    const suggestion =
      await foodSuggestionRepository.getFoodSuggestionById(suggestionId);
    if (!suggestion) {
      return res
        .status(404)
        .json({ success: false, message: "Food suggestion not found" });
    }

    const message = await chatMessageRepository.getMessageById(
      suggestion.message_id,
    );
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const isMember = await chatRoomRepository.isMemberOfRoom(
      message.room_id,
      req.user.id,
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat room",
      });
    }

    req.suggestion = suggestion;
    req.suggestionMessage = message;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireRoomMember,
  requirePollRoomMember,
  requireSpinSessionRoomMember,
  requireSuggestionRoomMember,
};
