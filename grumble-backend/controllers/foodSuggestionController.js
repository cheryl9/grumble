const foodSuggestionRepository = require("../repositories/foodSuggestionRepository");
const foodPlaceRepository = require("../repositories/foodPlaceRepository");
const { broadcastRoomEvent } = require("../services/realtime");

/**
 * Food Suggestion Controller
 * Handles HTTP requests for food suggestion reactions and details
 */

/**
 * GET /api/food-places/:id - Get food place details
 * Query params: user_lat (optional), user_lon (optional) - for distance calculation
 */
const getFoodPlaceDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_lat, user_lon } = req.query;

    const foodPlace = await foodPlaceRepository.getFoodPlaceById(id);
    if (!foodPlace) {
      return res.status(404).json({
        success: false,
        message: "Food place not found",
      });
    }

    // Optionally calculate distance if coordinates provided
    let distance = null;
    if (user_lat && user_lon) {
      const R = 6371; // Earth's radius in km
      const dLat =
        ((parseFloat(foodPlace.lat) - parseFloat(user_lat)) * Math.PI) / 180;
      const dLon =
        ((parseFloat(foodPlace.lon) - parseFloat(user_lon)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((parseFloat(user_lat) * Math.PI) / 180) *
          Math.cos((parseFloat(foodPlace.lat) * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = parseFloat((R * c).toFixed(2));
    }

    res.json({
      success: true,
      data: {
        ...foodPlace,
        distance,
      },
    });
  } catch (error) {
    console.error("Error fetching food place details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch food place details",
    });
  }
};

/**
 * POST /api/suggestions/:suggestionId/react - Like or dislike a food suggestion
 * Body: { reaction: 'like' | 'dislike' }
 */
const reactToSuggestion = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    // Validate reaction
    if (!reaction || !["like", "dislike"].includes(reaction)) {
      return res.status(400).json({
        success: false,
        message: 'Reaction must be either "like" or "dislike"',
      });
    }

    // membershipGuard ensures suggestion exists and requester is a room member
    const suggestion = req.suggestion;
    const message = req.suggestionMessage;
    const suggestionIdNum = suggestion.id;

    // Add or update reaction
    const userReaction = await foodSuggestionRepository.addOrUpdateReaction(
      suggestionIdNum,
      userId,
      reaction,
    );

    // Update counts
    const updatedSuggestion =
      await foodSuggestionRepository.updateReactionCounts(suggestionIdNum);

    // Get food place details
    const foodPlace = await foodPlaceRepository.getFoodPlaceById(
      updatedSuggestion.food_place_id,
    );

    // Get all reactions for reference
    const reactions =
      await foodSuggestionRepository.getReactionsForSuggestion(suggestionIdNum);

    broadcastRoomEvent(message.room_id, "reaction_update", {
      suggestion: updatedSuggestion,
      food_place: foodPlace,
      actor: { id: userId, username: req.user.username },
      your_reaction: userReaction ? userReaction.reaction : null,
      reactions_count: reactions.length,
    });

    res.json({
      success: true,
      data: {
        suggestion: updatedSuggestion,
        food_place: foodPlace,
        your_reaction: userReaction ? userReaction.reaction : null,
        reactions_count: reactions.length,
      },
      message: userReaction
        ? "Reaction updated successfully"
        : "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Error reacting to suggestion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reaction",
    });
  }
};

/**
 * DELETE /api/suggestions/:suggestionId/react - Remove reaction from a food suggestion
 */
const removeReactionFromSuggestion = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const userId = req.user.id;

    // membershipGuard ensures suggestion exists and requester is a room member
    const suggestion = req.suggestion;
    const message = req.suggestionMessage;
    const suggestionIdNum = suggestion.id;

    // Remove reaction
    await foodSuggestionRepository.removeReaction(suggestionIdNum, userId);

    // Update counts
    const updatedSuggestion =
      await foodSuggestionRepository.updateReactionCounts(suggestionIdNum);

    // Get food place details
    const foodPlace = await foodPlaceRepository.getFoodPlaceById(
      updatedSuggestion.food_place_id,
    );

    broadcastRoomEvent(message.room_id, "reaction_update", {
      suggestion: updatedSuggestion,
      food_place: foodPlace,
      actor: { id: userId, username: req.user.username },
      your_reaction: null,
    });

    res.json({
      success: true,
      data: {
        suggestion: updatedSuggestion,
        food_place: foodPlace,
        your_reaction: null,
      },
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove reaction",
    });
  }
};

module.exports = {
  getFoodPlaceDetails,
  reactToSuggestion,
  removeReactionFromSuggestion,
};
