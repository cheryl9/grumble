const analyticsRepository = require('../../repositories/admin/analyticsRepository');

/**
 * Dashboard Controller
 * Handles dashboard analytics API requests
 */

/**
 * Get dashboard overview statistics
 * GET /api/admin/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await analyticsRepository.getDashboardStats();
    const avgPostsPerUser = await analyticsRepository.getAveragePostsPerUser();
    
    // Calculate growth percentages (compare with previous period)
    const userGrowth = stats.posts_last_30d > 0 ? 
      ((stats.posts_last_30d / Math.max(stats.total_posts, 1)) * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(stats.total_users),
        activeUsers: parseInt(stats.active_users),
        activeUsers30d: parseInt(stats.active_users_30d),
        totalPosts: parseInt(stats.total_posts),
        postsLast30d: parseInt(stats.posts_last_30d),
        pendingReports: parseInt(stats.pending_reports),
        totalFoodPlaces: parseInt(stats.total_food_places),
        metrics: {
          userGrowthPercentage: parseFloat(userGrowth),
          avgPostsPerUser: parseFloat(avgPostsPerUser).toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user growth data for charts
 * GET /api/admin/dashboard/growth?months=12
 */
const getUserGrowth = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const growthData = await analyticsRepository.getUserGrowthData(parseInt(months));
    
    // Transform data for frontend chart
    const transformedData = growthData.map(item => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      users: parseInt(item.new_users)
    }));
    
    res.json({
      success: true,
      data: { growthData: transformedData }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get engagement metrics
 * GET /api/admin/dashboard/engagement
 */
const getEngagementMetrics = async (req, res, next) => {
  try {
    const metrics = await analyticsRepository.getEngagementMetrics();
    const dailyActive = await analyticsRepository.getDailyActiveUsers(30);
    const reportBreakdown = await analyticsRepository.getReportStatusBreakdown();
    
    res.json({
      success: true,
      data: {
        totalLikes: metrics.totalLikes,
        totalComments: metrics.totalComments,
        avgLikesPerPost: metrics.avgLikesPerPost,
        visibilityBreakdown: metrics.visibilityBreakdown,
        activeStreakPercentage: parseFloat(metrics.activeStreakPercentage).toFixed(1),
        dailyActiveUsers: dailyActive,
        reportStatusBreakdown: reportBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get streak statistics
 * GET /api/admin/dashboard/streaks
 */
const getStreakStats = async (req, res, next) => {
  try {
    const streakDistribution = await analyticsRepository.getStreakDistribution();
    
    // Transform data for frontend chart
    const transformedData = streakDistribution.map(item => ({
      range: item.streak_range,
      count: parseInt(item.user_count)
    }));
    
    res.json({
      success: true,
      data: { streakDistribution: transformedData }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top active users
 * GET /api/admin/dashboard/top-users?limit=10
 */
const getTopUsers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const topUsers = await analyticsRepository.getTopActiveUsers(parseInt(limit));
    
    res.json({
      success: true,
      data: { topUsers }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUserGrowth,
  getEngagementMetrics,
  getStreakStats,
  getTopUsers
};
