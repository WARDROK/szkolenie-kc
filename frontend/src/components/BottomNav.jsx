import { NavLink } from 'react-router-dom';
import { Target, Camera, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/', icon: Target, label: 'Tasks' },
  { to: '/feed', icon: Camera, label: 'Feed' },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function BottomNav() {
  const { logout, team } = useAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-strong safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-neon-cyan scale-105'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-gray-500 hover:text-neon-pink transition-colors"
          title="Logout"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Exit</span>
        </button>
      </div>
    </nav>
  );
}
