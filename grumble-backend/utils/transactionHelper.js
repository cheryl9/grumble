const pool = require("../config/db");

/**
 * Execute a function within a SERIALIZABLE transaction with automatic rollback on error.
 * This prevents race conditions in concurrent operations.
 *
 * @param {Function} callback - Async function that receives the client and should return a result
 * @returns {Promise} Result of the callback
 *
 * Example usage:
 * const result = await executeTransaction(async (client) => {
 *   const result = await client.query("SELECT * FROM users WHERE id = $1 FOR UPDATE", [userId]);
 *   // ... more queries ...
 *   return result.rows[0];
 * });
 */
async function executeTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { executeTransaction };
