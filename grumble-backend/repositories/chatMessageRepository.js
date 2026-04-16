const pool = require('../config/db');

/**
 * Chat Messages Repository
 * Handles database operations for chat messages and related features
 */

/**
 * Get paginated messages for a chat room
 */
const getMessagesForRoom = async (roomId, limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT cm.id, cm.room_id, cm.sender_id, u.username, u.phone_number,
            cm.message_type, cm.content, cm.reply_to_message_id, cm.created_at, cm.is_deleted
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.room_id = $1 AND cm.is_deleted = FALSE
     ORDER BY cm.created_at DESC
     LIMIT $2 OFFSET $3`,
    [roomId, limit, offset]
  );
  return result.rows;
};

/**
 * Get a single message by ID
 */
const getMessageById = async (messageId) => {
  const result = await pool.query(
    `SELECT cm.id, cm.room_id, cm.sender_id, u.username, u.phone_number,
            cm.message_type, cm.content, cm.reply_to_message_id, cm.created_at, cm.is_deleted
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.id = $1`,
    [messageId]
  );
  return result.rows[0];
};

/**
 * Create a text message
 */
const createTextMessage = async (
  roomId,
  senderId,
  content,
  replyToMessageId = null,
) => {
  const result = await pool.query(
    `INSERT INTO chat_messages (room_id, sender_id, message_type, content, reply_to_message_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, room_id, sender_id, message_type, content, reply_to_message_id, created_at`,
    [roomId, senderId, 'text', JSON.stringify(content), replyToMessageId]
  );
  return result.rows[0];
};

/**
 * Create a food suggestion message
 */
const createFoodSuggestionMessage = async (
  roomId,
  senderId,
  foodPlaceId,
  replyToMessageId = null,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const messageResult = await client.query(
      `INSERT INTO chat_messages (room_id, sender_id, message_type, content, reply_to_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id, sender_id, message_type, content, reply_to_message_id, created_at`,
      [
        roomId,
        senderId,
        'food_suggestion',
        JSON.stringify({ food_place_id: foodPlaceId }),
        replyToMessageId,
      ],
    );
    const message = messageResult.rows[0];

    const suggestionResult = await client.query(
      `INSERT INTO food_suggestions (message_id, food_place_id, likes, dislikes)
       VALUES ($1, $2, 0, 0)
       RETURNING id, message_id, food_place_id, likes, dislikes`,
      [message.id, foodPlaceId],
    );

    await client.query('COMMIT');

    return {
      ...message,
      suggestion: suggestionResult.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Create a poll message
 */
const createPollMessage = async (
  roomId,
  senderId,
  question,
  options,
  replyToMessageId = null,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const messageResult = await client.query(
      `INSERT INTO chat_messages (room_id, sender_id, message_type, content, reply_to_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id, sender_id, message_type, content, reply_to_message_id, created_at`,
      [
        roomId,
        senderId,
        'poll',
        JSON.stringify({ question, options }),
        replyToMessageId,
      ],
    );
    const message = messageResult.rows[0];

    const pollResult = await client.query(
      `INSERT INTO polls (message_id, question)
       VALUES ($1, $2)
       RETURNING id, message_id, question, created_at`,
      [message.id, question],
    );
    const poll = pollResult.rows[0];

    const pollOptions = [];
    for (let i = 0; i < options.length; i++) {
      const optionResult = await client.query(
        `INSERT INTO poll_options (poll_id, text, votes)
         VALUES ($1, $2, 0)
         RETURNING id, poll_id, text, votes`,
        [poll.id, options[i]],
      );
      pollOptions.push(optionResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      ...message,
      poll: {
        ...poll,
        options: pollOptions,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Create a spin wheel message
 */
const createSpinWheelMessage = async (
  roomId,
  senderId,
  options,
  replyToMessageId = null,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const messageResult = await client.query(
      `INSERT INTO chat_messages (room_id, sender_id, message_type, content, reply_to_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id, sender_id, message_type, content, reply_to_message_id, created_at`,
      [
        roomId,
        senderId,
        'spin_wheel',
        JSON.stringify({ options }),
        replyToMessageId,
      ],
    );
    const message = messageResult.rows[0];

    const sessionResult = await client.query(
      `INSERT INTO spin_wheel_sessions (message_id, options)
       VALUES ($1, $2)
       RETURNING id, message_id, options, result, spun_by, spun_at`,
      [message.id, JSON.stringify(options)],
    );

    await client.query('COMMIT');

    return {
      ...message,
      spin_wheel: sessionResult.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Soft delete a message
 */
const deleteMessage = async (messageId) => {
  const result = await pool.query(
    'UPDATE chat_messages SET is_deleted = TRUE WHERE id = $1 RETURNING *',
    [messageId]
  );
  return result.rows[0];
};

/**
 * Get a complete message with all related data
 */
const buildMessageSnippet = (row) => {
  if (!row) return null;

  const base = {
    id: row.id,
    type: row.message_type,
    sender: {
      id: row.sender_id,
      username: row.username,
    },
    created_at: row.created_at,
    is_deleted: row.is_deleted,
  };

  if (row.is_deleted) {
    return { ...base, text: "[deleted]" };
  }

  if (row.message_type === "text") {
    return { ...base, text: row.content?.text ?? "" };
  }

  if (row.message_type === "poll") {
    return { ...base, text: row.content?.question ? `Poll: ${row.content.question}` : "Poll" };
  }

  if (row.message_type === "food_suggestion") {
    return { ...base, text: "Food suggestion" };
  }

  if (row.message_type === "spin_wheel") {
    return { ...base, text: "Spin wheel" };
  }

  return base;
};

const getMessageSnippetById = async (messageId) => {
  const row = await getMessageById(messageId);
  return buildMessageSnippet(row);
};

const getCompleteMessage = async (messageId) => {
  const message = await getMessageById(messageId);
  if (!message) return null;

  const reply_to = message.reply_to_message_id
    ? await getMessageSnippetById(message.reply_to_message_id)
    : null;

  let payload = null;

  if (message.message_type === 'text') {
    payload = message.content;
  } else if (message.message_type === 'food_suggestion') {
    const suggestionResult = await pool.query(
      `SELECT fs.id,
              fs.message_id,
              fs.food_place_id,
              fs.likes,
              fs.dislikes,
              fp.name AS food_place_name,
              fp.address AS food_place_address,
              fp.photo_url AS food_place_photo_url
       FROM food_suggestions fs
       JOIN food_places fp ON fp.id = fs.food_place_id
       WHERE fs.message_id = $1`,
      [messageId]
    );

    if (suggestionResult.rows.length > 0) {
      const row = suggestionResult.rows[0];
      payload = {
        id: row.id,
        message_id: row.message_id,
        food_place_id: row.food_place_id,
        likes: row.likes,
        dislikes: row.dislikes,
        food_place: {
          id: row.food_place_id,
          name: row.food_place_name,
          address: row.food_place_address,
          photo_url: row.food_place_photo_url,
        },
      };
    }
  } else if (message.message_type === 'poll') {
    const pollResult = await pool.query(
      `SELECT p.id,
              p.message_id,
              p.question,
              p.created_at,
              json_agg(
                json_build_object(
                  'id', po.id,
                  'text', po.text,
                  'votes', COALESCE(v.votes, 0)
                )
                ORDER BY po.id
              ) AS options
       FROM polls p
       JOIN poll_options po ON p.id = po.poll_id
       LEFT JOIN (
         SELECT option_id, COUNT(*)::int AS votes
         FROM poll_votes
         WHERE poll_id = (SELECT id FROM polls WHERE message_id = $1)
         GROUP BY option_id
       ) v ON v.option_id = po.id
       WHERE p.message_id = $1
       GROUP BY p.id, p.message_id, p.question, p.created_at`,
      [messageId]
    );
    if (pollResult.rows.length > 0) {
      payload = pollResult.rows[0];
    }
  } else if (message.message_type === 'spin_wheel') {
    const sessionResult = await pool.query(
      `SELECT s.id,
              s.message_id,
              s.options,
              ls.result,
              ls.spun_at,
              ls.spun_by,
              u.username AS spun_by_username,
              (SELECT COUNT(*)::int FROM spin_wheel_spins WHERE session_id = s.id) AS spins_count
       FROM spin_wheel_sessions s
       LEFT JOIN LATERAL (
         SELECT result, spun_at, spun_by
         FROM spin_wheel_spins
         WHERE session_id = s.id
         ORDER BY spun_at DESC
         LIMIT 1
       ) ls ON true
       LEFT JOIN users u ON u.id = ls.spun_by
       WHERE s.message_id = $1`,
      [messageId]
    );
    if (sessionResult.rows.length > 0) {
      payload = sessionResult.rows[0];
    }
  }

  return {
    id: message.id,
    type: message.message_type,
    sender: {
      id: message.sender_id,
      username: message.username,
      phone_number: message.phone_number
    },
    reply_to_message_id: message.reply_to_message_id,
    reply_to,
    payload,
    created_at: message.created_at,
    is_deleted: message.is_deleted
  };
};

module.exports = {
  getMessagesForRoom,
  getMessageById,
  createTextMessage,
  createFoodSuggestionMessage,
  createPollMessage,
  createSpinWheelMessage,
  deleteMessage,
  getCompleteMessage
};
