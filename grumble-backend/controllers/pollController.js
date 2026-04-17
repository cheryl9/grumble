const pollRepository = require("../repositories/pollRepository");
const { broadcastRoomEvent } = require("../services/realtime");

/**
 * GET /api/polls/:pollId
 * Return poll details + current vote tallies.
 */
const getPoll = async (req, res) => {
  try {
    // membershipGuard ensures poll exists and requester is a room member
    res.json({ success: true, data: req.poll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ success: false, message: "Failed to fetch poll" });
  }
};

/**
 * POST /api/polls/:pollId/vote
 * Body: { option_id: number }
 * Allow vote changes and new votes.
 */
const vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { option_id } = req.body;
    const userId = req.user.id;

    if (!option_id) {
      return res
        .status(400)
        .json({ success: false, message: "option_id is required" });
    }

    // membershipGuard ensures poll exists and requester is a room member

    const result = await pollRepository.castVote(pollId, option_id, userId);

    if (!result.ok && result.reason === "option_not_found") {
      return res
        .status(404)
        .json({ success: false, message: "Poll option not found" });
    }

    const updatedPoll = await pollRepository.getPollById(pollId);
    const userVote = await pollRepository.getUserVote(pollId, userId);

    broadcastRoomEvent(updatedPoll.room_id, "poll_update", {
      poll: updatedPoll,
      actor: { id: userId, username: req.user.username },
      action: result.changed ? "vote_changed" : "vote_cast",
    });

    res.json({
      success: true,
      data: updatedPoll,
      user_vote: userVote,
      message: result.changed
        ? "Vote changed successfully"
        : "Vote cast successfully",
    });
  } catch (error) {
    console.error("Error voting in poll:", error);
    res.status(500).json({ success: false, message: "Failed to vote" });
  }
};

/**
 * DELETE /api/polls/:pollId/vote
 * Remove current user's vote from a poll.
 */
const removeVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    // membershipGuard ensures poll exists and requester is a room member

    const result = await pollRepository.removeVote(pollId, userId);

    if (!result.ok && result.reason === "no_vote") {
      return res
        .status(400)
        .json({ success: false, message: "You have not voted in this poll" });
    }

    const updatedPoll = await pollRepository.getPollById(pollId);

    broadcastRoomEvent(updatedPoll.room_id, "poll_update", {
      poll: updatedPoll,
      actor: { id: userId, username: req.user.username },
      action: "vote_removed",
    });

    res.json({
      success: true,
      data: updatedPoll,
      message: "Vote removed successfully",
    });
  } catch (error) {
    console.error("Error removing vote:", error);
    res.status(500).json({ success: false, message: "Failed to remove vote" });
  }
};

/**
 * GET /api/polls/:pollId/votes
 * Breakdown of which users voted for which options.
 */
const getVotes = async (req, res) => {
  try {
    const { pollId } = req.params;

    // membershipGuard ensures poll exists and requester is a room member

    const breakdown = await pollRepository.getVotesBreakdown(pollId);

    res.json({
      success: true,
      data: {
        poll_id: parseInt(pollId),
        options: breakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching poll votes:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch poll votes" });
  }
};

module.exports = {
  getPoll,
  vote,
  removeVote,
  getVotes,
};
