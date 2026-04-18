const pool = require("../config/db");

/**
 * Spin Wheel Repository
 * Database operations for spin wheel sessions and spin history.
 */

const getSessionById = async (sessionId) => {
  const result = await pool.query(
    `SELECT s.id,
            s.message_id,
            cm.room_id,
            s.options,
            s.result,
            s.spun_by,
            s.spun_at
     FROM spin_wheel_sessions s
     JOIN chat_messages cm ON cm.id = s.message_id
     WHERE s.id = $1`,
    [sessionId],
  );
  return result.rows[0] || null;
};

const getSpinHistory = async (sessionId) => {
  const result = await pool.query(
    `SELECT sws.id,
            sws.session_id,
            sws.result,
            sws.spun_at,
            u.id AS user_id,
            u.username
     FROM spin_wheel_spins sws
     JOIN users u ON u.id = sws.spun_by
     WHERE sws.session_id = $1
     ORDER BY sws.spun_at ASC`,
    [sessionId],
  );
  return result.rows;
};

const createSpinResult = async (sessionId, spunBy, resultValue) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sessionRes = await client.query(
      `SELECT id, options
       FROM spin_wheel_sessions
       WHERE id = $1`,
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "session_not_found" };
    }

    const options = sessionRes.rows[0].options;
    if (!Array.isArray(options) || !options.includes(resultValue)) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid_result" };
    }

    const spinInsert = await client.query(
      `INSERT INTO spin_wheel_spins (session_id, result, spun_by)
       VALUES ($1, $2, $3)
       RETURNING id, session_id, result, spun_by, spun_at`,
      [sessionId, resultValue, spunBy],
    );

    // Update session with latest spin metadata
    await client.query(
      `UPDATE spin_wheel_sessions
       SET result = $1, spun_by = $2, spun_at = NOW()
       WHERE id = $3`,
      [resultValue, spunBy, sessionId],
    );

    await client.query("COMMIT");

    return { ok: true, spin: spinInsert.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getSessionById,
  getSpinHistory,
  createSpinResult,
};
