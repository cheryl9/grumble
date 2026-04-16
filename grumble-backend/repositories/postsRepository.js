const pool = require("../config/db");

// Helper function to construct full image URL
function getFullImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl; // Already a full URL
  return `http://localhost:5001${imageUrl}`; // Prepend backend URL
}

// Helper function to transform a post row to include full image URLs
function transformPost(row) {
  if (!row) return null;
  return {
    ...row,
    image_url: getFullImageUrl(row.image_url),
  };
}

// Helper function to transform multiple posts
function transformPosts(rows) {
  return rows.map(transformPost);
}

// feed

/**
 * Get feed posts.
 * tab = 'foryou'  → all public posts, newest first
 * tab = 'friends' → public posts from users the current user is friends with
 * tab = 'mine'    → all posts by the current user (any visibility)
 *
 * NOTE: 'friends' tab requires a friends/follows table that doesn't exist yet.
 * Falls back to 'foryou' behaviour until that table is added.
 */
async function getFeedPosts(userId, tab = "foryou", limit = 20, offset = 0) {
  let query;
  let params;

  if (tab === "mine") {
    query = `
      SELECT
        p.id, p.user_id, p.food_place_id, p.location_name,
        p.rating, p.image_url, p.description, p.visibility,
        p.likes_count, p.comments_count, p.saves_count,
        p.created_at,
        u.username,
        fp.name  AS place_name,
        fp.cuisine,
        fp.category,
        fp.lat,
        fp.lon,
        EXISTS (
          SELECT 1 FROM likes l
          WHERE l.post_id = p.id AND l.user_id = $1
        ) AS liked_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN food_places fp ON fp.id = p.food_place_id
      WHERE p.user_id = $1
        AND p.is_deleted = false
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [userId, limit, offset];
  } else {
    // 'foryou' and 'friends' fallback
    query = `
      SELECT
        p.id, p.user_id, p.food_place_id, p.location_name,
        p.rating, p.image_url, p.description, p.visibility,
        p.likes_count, p.comments_count, p.saves_count,
        p.created_at,
        u.username,
        fp.name  AS place_name,
        fp.cuisine,
        fp.category,
        fp.lat,
        fp.lon,
        EXISTS (
          SELECT 1 FROM likes l
          WHERE l.post_id = p.id AND l.user_id = $1
        ) AS liked_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN food_places fp ON fp.id = p.food_place_id
      WHERE p.visibility = 'public'
        AND p.is_deleted = false
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [userId, limit, offset];
  }

  const result = await pool.query(query, params);
  return transformPosts(result.rows);
}

// single post with comments
async function getPostById(postId, userId) {
  const result = await pool.query(
    `SELECT
      p.id, p.user_id, p.food_place_id, p.location_name,
      p.rating, p.image_url, p.description, p.visibility,
      p.likes_count, p.comments_count, p.saves_count,
      p.created_at,
      u.username,
      fp.name  AS place_name,
      fp.cuisine,
      fp.category,
      EXISTS (
        SELECT 1 FROM likes l
        WHERE l.post_id = p.id AND l.user_id = $2
      ) AS liked_by_me
    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN food_places fp ON fp.id = p.food_place_id
    WHERE p.id = $1
      AND p.is_deleted = false`,
    [postId, userId],
  );
  return transformPost(result.rows[0] || null);
}

// create post

async function createPost({
  userId,
  foodPlaceId,
  locationName,
  rating,
  imageUrl,
  description,
  visibility,
}) {
  const result = await pool.query(
    `INSERT INTO posts
       (user_id, food_place_id, location_name, rating, image_url, description, visibility)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      foodPlaceId || null,
      locationName || null,
      rating || null,
      imageUrl || null,
      description || null,
      visibility || "public",
    ],
  );
  return transformPost(result.rows[0]);
}

// likes

/**
 * Toggle like on a post.
 * Returns { liked: true } if like was added, { liked: false } if removed.
 * Also keeps the denormalised likes_count in sync.
 */
async function toggleLike(postId, userId) {
  const existing = await pool.query(
    `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`, [
      postId,
      userId,
    ]);
    await pool.query(
      `UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`,
      [postId],
    );
    return { liked: false };
  } else {
    await pool.query(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`, [
      postId,
      userId,
    ]);
    await pool.query(
      `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`,
      [postId],
    );
    return { liked: true };
  }
}

// comments
async function getCommentsByPostId(postId) {
  const result = await pool.query(
    `SELECT
      c.id, c.post_id, c.user_id, c.content, c.created_at,
      u.username
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.post_id = $1
      AND c.is_deleted = false
    ORDER BY c.created_at ASC`,
    [postId],
  );
  return result.rows;
}

async function createComment(postId, userId, content) {
  const result = await pool.query(
    `INSERT INTO comments (post_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [postId, userId, content],
  );
  await pool.query(
    `UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`,
    [postId],
  );
  return result.rows[0];
}

// saves
async function toggleSave(postId, userId) {
  const existing = await pool.query(
    `SELECT id FROM saves WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM saves WHERE post_id = $1 AND user_id = $2`, [
      postId,
      userId,
    ]);
    await pool.query(
      `UPDATE posts SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = $1`,
      [postId],
    );
    return { saved: false };
  } else {
    await pool.query(`INSERT INTO saves (post_id, user_id) VALUES ($1, $2)`, [
      postId,
      userId,
    ]);
    await pool.query(
      `UPDATE posts SET saves_count = saves_count + 1 WHERE id = $1`,
      [postId],
    );
    return { saved: true };
  }
}

/**
 * Get all posts saved by the current user, newest save first.
 * Returns same shape as getFeedPosts so the frontend can treat them uniformly.
 */
async function getSavedPosts(userId, limit = 20, offset = 0) {
  const result = await pool.query(
    `SELECT
      p.id, p.user_id, p.food_place_id, p.location_name,
      p.rating, p.image_url, p.description, p.visibility,
      p.likes_count, p.comments_count, p.saves_count,
      p.created_at,
      u.username,
      fp.name    AS place_name,
      fp.cuisine,
      fp.category,
      fp.lat,
      fp.lon,
      true AS saved_by_me,
      EXISTS (
        SELECT 1 FROM likes l
        WHERE l.post_id = p.id AND l.user_id = $1
      ) AS liked_by_me
    FROM saves s
    JOIN posts p ON p.id = s.post_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN food_places fp ON fp.id = p.food_place_id
    WHERE s.user_id = $1
      AND p.is_deleted = false
    ORDER BY s.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return transformPosts(result.rows);
}

module.exports = {
  getFeedPosts,
  getPostById,
  createPost,
  toggleLike,
  getCommentsByPostId,
  createComment,
  toggleSave,
  getSavedPosts,
};
