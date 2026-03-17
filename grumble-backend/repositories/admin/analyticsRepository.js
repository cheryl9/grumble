const pool = require('../../config/db');

/**
 * Analytics Repository
 * Database queries for dashboard analytics and metrics
 */

/**
 * Get dashboard statistics overview
 * Returns: total users, active users, total posts, pending reports, food places
 */
const getDashboardStats = async () => {
  const stats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE is_deleted = false) as total_users,
      (SELECT COUNT(*) FROM users WHERE is_deleted = false AND account_status = 'active') as active_users,
      (SELECT COUNT(DISTINCT id) FROM users WHERE is_deleted = false 
        AND updated_at >= NOW() - INTERVAL '30 days') as active_users_30d,
      (SELECT COUNT(*) FROM posts WHERE is_deleted = false) as total_posts,
      (SELECT COUNT(*) FROM posts WHERE is_deleted = false 
        AND created_at >= NOW() - INTERVAL '30 days') as posts_last_30d,
      (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
      (SELECT COUNT(*) FROM food_places) as total_food_places
  `);
  
  return stats.rows[0];
};

/**
 * Get user growth data for charts
 * Returns: monthly registration counts
 */
const getUserGrowthData = async (months = 12) => {
  const result = await pool.query(`
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as new_users
    FROM users
    WHERE created_at >= NOW() - INTERVAL '${parseInt(months)} months'
      AND is_deleted = false
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC
  `);
  
  return result.rows;
};

/**
 * Get streak distribution for visualization
 * Returns: count of users in each streak range
 */
const getStreakDistribution = async () => {
  // First check if user_streaks table exists and has data
  const checkTable = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'user_streaks'
    );
  `);
  
  if (!checkTable.rows[0].exists) {
    // Return empty data if table doesn't exist yet
    return [
      { streak_range: '0 days', user_count: 0 },
      { streak_range: '1-3 days', user_count: 0 },
      { streak_range: '4-7 days', user_count: 0 },
      { streak_range: '8-14 days', user_count: 0 },
      { streak_range: '15-30 days', user_count: 0 },
      { streak_range: '30+ days', user_count: 0 }
    ];
  }

  const result = await pool.query(`
    WITH streak_ranges AS (
      SELECT 
        CASE 
          WHEN current_streak = 0 THEN '0 days'
          WHEN current_streak BETWEEN 1 AND 3 THEN '1-3 days'
          WHEN current_streak BETWEEN 4 AND 7 THEN '4-7 days'
          WHEN current_streak BETWEEN 8 AND 14 THEN '8-14 days'
          WHEN current_streak BETWEEN 15 AND 30 THEN '15-30 days'
          ELSE '30+ days'
        END as streak_range,
        CASE 
          WHEN current_streak = 0 THEN 1
          WHEN current_streak BETWEEN 1 AND 3 THEN 2
          WHEN current_streak BETWEEN 4 AND 7 THEN 3
          WHEN current_streak BETWEEN 8 AND 14 THEN 4
          WHEN current_streak BETWEEN 15 AND 30 THEN 5
          ELSE 6
        END as sort_order
      FROM user_streaks
    )
    SELECT 
      streak_range,
      COUNT(*) as user_count
    FROM streak_ranges
    GROUP BY streak_range, sort_order
    ORDER BY sort_order
  `);
  
  return result.rows;
};

/**
 * Get engagement metrics
 * Returns: total likes, total comments, avg likes per post, post visibility breakdown, active streak ratio
 */
const getEngagementMetrics = async () => {
  // Get total likes and comments
  const engagement = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM likes) as total_likes,
      (SELECT COUNT(*) FROM comments WHERE is_deleted = false) as total_comments,
      (SELECT COUNT(*) FROM posts WHERE is_deleted = false) as total_posts
  `);
  
  const totalLikes = parseInt(engagement.rows[0].total_likes) || 0;
  const totalComments = parseInt(engagement.rows[0].total_comments) || 0;
  const totalPosts = parseInt(engagement.rows[0].total_posts) || 1; // Avoid division by zero
  const avgLikesPerPost = (totalLikes / totalPosts).toFixed(2);
  
  const visibilityBreakdown = await pool.query(`
    SELECT 
      visibility,
      COUNT(*) as count
    FROM posts
    WHERE is_deleted = false
    GROUP BY visibility
  `);
  
  // Check if user_streaks table exists
  const checkTable = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'user_streaks'
    );
  `);

  let activeStreakPercentage = 0;
  if (checkTable.rows[0].exists) {
    const activeStreakRatio = await pool.query(`
      SELECT 
        COUNT(CASE WHEN current_streak > 0 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as active_streak_percentage
      FROM user_streaks
    `);
    activeStreakPercentage = activeStreakRatio.rows[0]?.active_streak_percentage || 0;
  }
  
  return {
    totalLikes,
    totalComments,
    avgLikesPerPost,
    visibilityBreakdown: visibilityBreakdown.rows,
    activeStreakPercentage: activeStreakPercentage
  };
};

/**
 * Get top active users
 * Returns: users with most posts in last 30 days
 */
const getTopActiveUsers = async (limit = 10) => {
  // Check if user_streaks table exists
  const checkTable = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'user_streaks'
    );
  `);

  let query;
  if (checkTable.rows[0].exists) {
    query = `
      SELECT 
        u.id,
        u.username,
        u.phone_number,
        COUNT(p.id) as post_count,
        COALESCE(us.current_streak, 0) as current_streak,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND p.created_at >= NOW() - INTERVAL '30 days'
        AND p.is_deleted = false
      LEFT JOIN user_streaks us ON u.id = us.user_id
      WHERE u.is_deleted = false
      GROUP BY u.id, u.username, u.phone_number, us.current_streak
      HAVING COUNT(p.id) > 0
      ORDER BY post_count DESC, current_streak DESC
      LIMIT $1
    `;
  } else {
    query = `
      SELECT 
        u.id,
        u.username,
        u.phone_number,
        COUNT(p.id) as post_count,
        0 as current_streak,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND p.created_at >= NOW() - INTERVAL '30 days'
        AND p.is_deleted = false
      WHERE u.is_deleted = false
      GROUP BY u.id, u.username, u.phone_number
      HAVING COUNT(p.id) > 0
      ORDER BY post_count DESC
      LIMIT $1
    `;
  }

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get daily active users for last N days
 * Returns: daily user activity counts
 */
const getDailyActiveUsers = async (days = 30) => {
  const result = await pool.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(DISTINCT user_id) as active_users
    FROM posts
    WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      AND is_deleted = false
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);
  
  return result.rows;
};

/**
 * Get average posts per user
 */
const getAveragePostsPerUser = async () => {
  const result = await pool.query(`
    SELECT 
      COUNT(p.id)::float / NULLIF(COUNT(DISTINCT u.id), 0) as avg_posts_per_user
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id AND p.is_deleted = false
    WHERE u.is_deleted = false
  `);
  
  return result.rows[0]?.avg_posts_per_user || 0;
};

/**
 * Get monthly active users for the last N months
 * Returns users who posted at least once in each month
 */
const getMonthlyActiveUsers = async (months = 12) => {
  const result = await pool.query(`
    SELECT
      DATE_TRUNC('month', p.created_at) as month,
      COUNT(DISTINCT p.user_id) as active_users
    FROM posts p
    WHERE p.created_at >= NOW() - INTERVAL '${parseInt(months)} months'
      AND p.is_deleted = false
    GROUP BY DATE_TRUNC('month', p.created_at)
    ORDER BY month ASC
  `);

  return result.rows;
};

/**
 * Get report status breakdown
 */
const getReportStatusBreakdown = async () => {
  const result = await pool.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM reports
    GROUP BY status
  `);
  
  return result.rows;
};

module.exports = {
  getDashboardStats,
  getUserGrowthData,
  getStreakDistribution,
  getEngagementMetrics,
  getTopActiveUsers,
  getDailyActiveUsers,
  getAveragePostsPerUser,
  getMonthlyActiveUsers,
  getReportStatusBreakdown
};
