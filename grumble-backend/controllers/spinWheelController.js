const spinWheelRepository = require("../repositories/spinWheelRepository");
const pool = require("../config/db");
const { broadcastRoomEvent } = require("../services/realtime");

/**
 * POST /api/spin-wheels/:sessionId/spin
 * Persist a client-side spin result: { result: "Japanese" }
 */
const spin = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { result } = req.body;
    const userId = req.user.id;

    if (!result || typeof result !== "string" || !result.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "result is required" });
    }

    // membershipGuard ensures session exists and requester is a room member
    const session = req.spinSession;

    const spinResult = await spinWheelRepository.createSpinResult(
      sessionId,
      userId,
      result.trim(),
    );

    if (!spinResult.ok && spinResult.reason === "invalid_result") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Result must be one of the session options",
        });
    }

    if (!spinResult.ok && spinResult.reason === "session_not_found") {
      return res
        .status(404)
        .json({ success: false, message: "Spin wheel session not found" });
    }

    // Enrich spin payload with user profile info
    const userRes = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId],
    );
    const user = userRes.rows[0] || { id: userId, username: req.user.username };

    const payload = {
      session_id: parseInt(sessionId),
      spin: {
        id: spinResult.spin.id,
        result: spinResult.spin.result,
        spun_at: spinResult.spin.spun_at,
        user,
      },
    };

    broadcastRoomEvent(session.room_id, "spin_result", payload);

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    console.error("Error persisting spin result:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to persist spin result" });
  }
};

/**
 * GET /api/spin-wheels/:sessionId
 * Retrieve session details and history of all spins.
 */
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // membershipGuard ensures session exists and requester is a room member
    const session = req.spinSession;

    const spins = await spinWheelRepository.getSpinHistory(sessionId);

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          message_id: session.message_id,
          room_id: session.room_id,
          options: session.options,
          latest: {
            result: session.result,
            spun_by: session.spun_by,
            spun_at: session.spun_at,
          },
        },
        spins,
      },
    });
  } catch (error) {
    console.error("Error fetching spin wheel session:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch spin wheel session" });
  }
};

module.exports = {
  spin,
  getSession,
};
