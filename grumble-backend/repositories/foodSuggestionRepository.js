const pool = require('../config/db');

/**
 * Food Suggestions Repository
 * Handles database operations for food suggestions and reactions
 */

/**
 * Get food suggestion by ID with reaction counts
 */
const getFoodSuggestionById = async (suggestionId) => {
  const result = await pool.query(
    `SELECT fs.id, fs.message_id, fs.food_place_id, fs.likes, fs.dislikes, fs.created_at
     FROM food_suggestions fs
     WHERE fs.id = $1`,
    [suggestionId]
  );
  return result.rows[0];
};

/**
 * Get user's reaction to a food suggestion (if any)
 */
const getUserReaction = async (suggestionId, userId) => {
  const result = await pool.query(
    `SELECT id, suggestion_id, user_id, reaction, created_at
     FROM food_suggestion_reactions
     WHERE suggestion_id = $1 AND user_id = $2`,
    [suggestionId, userId]
  );
  return result.rows[0];
};

/**
 * Add or update user reaction to a food suggestion
 * If user already reacted, this will update their reaction
 */
const addOrUpdateReaction = async (suggestionId, userId, reaction) => {
  // First, get existing reaction if any
  const existingReaction = await getUserReaction(suggestionId, userId);
  
  if (existingReaction) {
    // If same reaction, remove it (toggle behavior)
    if (existingReaction.reaction === reaction) {
      await removeReaction(suggestionId, userId);
      return null;
    }
    // Otherwise, update the reaction
    const result = await pool.query(
      `UPDATE food_suggestion_reactions 
       SET reaction = $1, created_at = NOW()
       WHERE suggestion_id = $2 AND user_id = $3
       RETURNING id, suggestion_id, user_id, reaction, created_at`,
      [reaction, suggestionId, userId]
    );
    return result.rows[0];
  } else {
    // Create new reaction
    const result = await pool.query(
      `INSERT INTO food_suggestion_reactions (suggestion_id, user_id, reaction)
       VALUES ($1, $2, $3)
       RETURNING id, suggestion_id, user_id, reaction, created_at`,
      [suggestionId, userId, reaction]
    );
    return result.rows[0];
  }
};

/**
 * Remove user reaction from a food suggestion
 */
const removeReaction = async (suggestionId, userId) => {
  const result = await pool.query(
    `DELETE FROM food_suggestion_reactions
     WHERE suggestion_id = $1 AND user_id = $2
     RETURNING id, suggestion_id, user_id, reaction, created_at`,
    [suggestionId, userId]
  );
  return result.rows[0];
};

/**
 * Recalculate and update like/dislike counts for a food suggestion
 */
const updateReactionCounts = async (suggestionId) => {
  // Count likes and dislikes
  const countsResult = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN reaction = 'like' THEN 1 ELSE 0 END), 0) as likes,
       COALESCE(SUM(CASE WHEN reaction = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes
     FROM food_suggestion_reactions
     WHERE suggestion_id = $1`,
    [suggestionId]
  );

  const { likes, dislikes } = countsResult.rows[0];

  // Update the food_suggestions table
  const result = await pool.query(
    `UPDATE food_suggestions
     SET likes = $1, dislikes = $2
     WHERE id = $3
     RETURNING id, message_id, food_place_id, likes, dislikes, created_at`,
    [likes, dislikes, suggestionId]
  );

  return result.rows[0];
};

/**
 * Get all reactions for a food suggestion
 */
const getReactionsForSuggestion = async (suggestionId) => {
  const result = await pool.query(
    `SELECT fsr.id, fsr.user_id, u.username, fsr.reaction, fsr.created_at
     FROM food_suggestion_reactions fsr
     JOIN users u ON fsr.user_id = u.id
     WHERE fsr.suggestion_id = $1
     ORDER BY fsr.created_at DESC`,
    [suggestionId]
  );
  return result.rows;
};

/**
 * Get all food suggestions in a message
 */
const getFoodSuggestionsForMessage = async (messageId) => {
  const result = await pool.query(
    `SELECT fs.id, fs.message_id, fs.food_place_id, fs.likes, fs.dislikes, fs.created_at
     FROM food_suggestions fs
     WHERE fs.message_id = $1`,
    [messageId]
  );
  return result.rows;
};

module.exports = {
  getFoodSuggestionById,
  getUserReaction,
  addOrUpdateReaction,
  removeReaction,
  updateReactionCounts,
  getReactionsForSuggestion,
  getFoodSuggestionsForMessage
};
