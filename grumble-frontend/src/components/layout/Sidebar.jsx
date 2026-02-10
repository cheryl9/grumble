import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Add logout logic
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { path: ROUTES.EXPLORE, label: 'Explore', icon: '🔍' },
    { path: ROUTES.FIND_SPOTS, label: 'Find Spots', icon: '📍' },
    { path: ROUTES.FOOD_MAP, label: 'Food Map', icon: '🗺️' },
    { path: ROUTES.CHATS, label: 'Chats', icon: '💬' },
    { path: ROUTES.PROFILE, label: 'Profile', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-dark text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Grumble
      </div>
      
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive ? 'bg-primary' : 'hover:bg-gray-700'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="m-4 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}