import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import logo from '../../assets/logo.png';
import { LayoutDashboard, Users, FileText, Flag, HelpCircle, LogOut, History, Settings } from 'lucide-react';
import { getReports } from '../../services/adminReportService';

/**
 * AdminLayout Component
 * Main layout for admin panel with sidebar navigation
 */
export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const result = await getReports({ status: 'pending', page: 1, limit: 1 });
        setPendingReports(result?.pagination?.total || 0);
      } catch (error) {
        setPendingReports(0);
      }
    };

    loadPendingCount();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/posts', icon: FileText, label: 'Posts' },
    { path: '/admin/reports', icon: Flag, label: 'Reports' },
    { path: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
  ];

  const secondaryNavItems = [
    { path: '/admin/logs', icon: History, label: 'Activity Logs' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Grumble" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold">Grumble Admin</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.path === '/admin/reports' && pendingReports > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {pendingReports}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Secondary Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <ul className="space-y-2">
              {secondaryNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">{admin?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{admin?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
