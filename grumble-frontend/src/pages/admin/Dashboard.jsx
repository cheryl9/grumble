import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  getStats, 
  getUserGrowth, 
  getEngagementMetrics, 
  getStreakStats, 
  getTopUsers 
} from '../../services/adminDashboardService';
import StatsCard from '../../components/admin/StatsCard';
import MetricsChart from '../../components/admin/MetricsChart';
import TopUsersTable from '../../components/admin/TopUsersTable';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [engagementData, setEngagementData] = useState(null);
  const [streakData, setStreakData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsRes, growthRes, engagementRes, streakRes, usersRes] = await Promise.all([
        getStats(),
        getUserGrowth(12),
        getEngagementMetrics(),
        getStreakStats(),
        getTopUsers(10)
      ]);

      setStats(statsRes);
      setGrowthData(growthRes.growthData || []);
      setEngagementData(engagementRes);
      setStreakData(streakRes.streakDistribution || []);
      setTopUsers(usersRes.topUsers || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {admin?.fullName || admin?.username}!</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            change={stats?.metrics?.userGrowthPercentage || 0}
            trend={(stats?.metrics?.userGrowthPercentage || 0) >= 0 ? 'up' : 'down'}
            variant="blue"
          />
          <StatsCard
            title="Total Posts"
            value={stats?.totalPosts || 0}
            change={stats?.postsLast30d || 0}
            trend="neutral"
            variant="orange"
            changeLabel="posts in last 30 days"
          />
          <StatsCard
            title="Food Places"
            value={stats?.totalFoodPlaces || 0}
            variant="green"
          />
          <StatsCard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            variant="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">User Growth (Last 12 Months)</h2>
            <MetricsChart
              data={growthData}
              type="line"
              dataKey="users"
              categoryKey="month"
              title=""
            />
          </div>

          {/* Streak Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Streak Distribution</h2>
            <MetricsChart
              data={streakData}
              type="bar"
              dataKey="count"
              categoryKey="range"
              title=""
            />
          </div>
        </div>

        {/* Engagement Charts */}
        {engagementData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Post Visibility Breakdown</h2>
              <MetricsChart
                data={engagementData.visibilityBreakdown || []}
                type="pie"
                dataKey="count"
                categoryKey="visibility"
                title=""
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Active Users (Last 30 Days)</h2>
              <MetricsChart
                data={(engagementData.dailyActiveUsers || []).map((item) => ({
                  ...item,
                  date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }))}
                type="line"
                dataKey="active_users"
                categoryKey="date"
                title=""
              />
            </div>
          </div>
        )}

        {/* Engagement KPI Strip */}
        {engagementData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Total Likes</p>
                <p className="text-3xl font-bold text-orange-600">{engagementData.totalLikes || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Total Comments</p>
                <p className="text-3xl font-bold text-blue-600">{engagementData.totalComments || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Avg. Likes/Post</p>
                <p className="text-3xl font-bold text-green-600">
                  {engagementData.avgLikesPerPost ? parseFloat(engagementData.avgLikesPerPost).toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Active Streak Users</p>
                <p className="text-3xl font-bold text-purple-600">{engagementData.activeStreakPercentage || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Active Users */}
        <TopUsersTable users={topUsers} />
      </main>
    </div>
  );
}
