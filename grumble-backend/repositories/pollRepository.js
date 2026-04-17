const pool = require("../config/db");

/**
 * Poll Repository
 * Database operations for polls, options, and votes.
 */

const getPollById = async (pollId) => {
  const result = await pool.query(
    `SELECT p.id,
            p.message_id,
            cm.room_id,
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
     JOIN chat_messages cm ON cm.id = p.message_id
     JOIN poll_options po ON po.poll_id = p.id
     LEFT JOIN (
       SELECT option_id, COUNT(*)::int AS votes
       FROM poll_votes
       WHERE poll_id = $1
       GROUP BY option_id
     ) v ON v.option_id = po.id
     WHERE p.id = $1
     GROUP BY p.id, p.message_id, cm.room_id, p.question, p.created_at`,
    [pollId],
  );

  return result.rows[0] || null;
};

const getPollOption = async (pollId, optionId) => {
  const result = await pool.query(
    `SELECT id, poll_id, text
     FROM poll_options
     WHERE poll_id = $1 AND id = $2`,
    [pollId, optionId],
  );
  return result.rows[0] || null;
};

const getUserVote = async (pollId, userId) => {
  const result = await pool.query(
    `SELECT id, option_id, voted_at
     FROM poll_votes
     WHERE poll_id = $1 AND user_id = $2`,
    [pollId, userId],
  );
  return result.rows[0] || null;
};

const castVote = async (pollId, optionId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const optionCheck = await client.query(
      `SELECT id, poll_id
       FROM poll_options
       WHERE poll_id = $1 AND id = $2`,
      [pollId, optionId],
    );

    if (optionCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "option_not_found" };
    }

    // Check if user already voted (for change detection)
    const existingVote = await client.query(
      `SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId],
    );

    const isChange =
      existingVote.rows.length > 0 &&
      existingVote.rows[0].option_id !== optionId;
    const isNew = existingVote.rows.length === 0;

    if (isChange) {
      const oldOptionId = existingVote.rows[0].option_id;
      // Change vote: decrement old, increment new
      await client.query(
        `UPDATE poll_options SET votes = GREATEST(votes - 1, 0) WHERE id = $1 AND poll_id = $2`,
        [oldOptionId, pollId],
      );
    }

    const upsertVote = await client.query(
      `INSERT INTO poll_votes (poll_id, option_id, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = $2, voted_at = NOW()
       RETURNING id, option_id, voted_at`,
      [pollId, optionId, userId],
    );

    // Increment new option vote count
    if (isNew || isChange) {
      await client.query(
        `UPDATE poll_options SET votes = votes + 1 WHERE id = $1 AND poll_id = $2`,
        [optionId, pollId],
      );
    }

    await client.query("COMMIT");
    return { ok: true, changed: isChange, vote: upsertVote.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getVotesBreakdown = async (pollId) => {
  const result = await pool.query(
    `SELECT po.id AS option_id,
            po.text,
            COALESCE(COUNT(pv.id), 0)::int AS votes,
            COALESCE(
              json_agg(
                json_build_object('id', u.id, 'username', u.username)
                ORDER BY u.username
              ) FILTER (WHERE u.id IS NOT NULL),
              '[]'::json
            ) AS voters
     FROM poll_options po
     LEFT JOIN poll_votes pv ON pv.option_id = po.id AND pv.poll_id = po.poll_id
     LEFT JOIN users u ON u.id = pv.user_id
     WHERE po.poll_id = $1
     GROUP BY po.id, po.text
     ORDER BY po.id`,
    [pollId],
  );

  return result.rows;
};

const removeVote = async (pollId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingVote = await client.query(
      `SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId],
    );

    if (existingVote.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "no_vote" };
    }

    const optionId = existingVote.rows[0].option_id;

    await client.query(
      `DELETE FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId],
    );

    // Decrement option vote count
    await client.query(
      `UPDATE poll_options SET votes = GREATEST(votes - 1, 0) WHERE id = $1 AND poll_id = $2`,
      [optionId, pollId],
    );

    await client.query("COMMIT");
    return { ok: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getPollById,
  getPollOption,
  getUserVote,
  castVote,
  removeVote,
  getVotesBreakdown,
};
