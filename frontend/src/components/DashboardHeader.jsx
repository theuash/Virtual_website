import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader({ title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header 
      className="sticky top-0 z-50 border-b backdrop-blur-xl transition-all"
      style={{ 
        borderColor: 'var(--border-light)',
        background: 'linear-gradient(135deg, rgba(34, 42, 54, 0.5) 0%, rgba(57, 17, 125, 0.1) 100%)',
        boxShadow: '0 8px 32px rgba(57, 17, 125, 0.08), inset 0 1px 0 rgba(57, 17, 125, 0.1)'
      }}
    >
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {title}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Welcome back, {user?.fullName || user?.name || 'User'}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(34, 42, 54, 0.4)',
              borderColor: 'var(--border-light)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(57, 17, 125, 0.08)'
            }}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate(`/${user?.role}/settings`)}
            className="p-2.5 rounded-lg border transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(34, 42, 54, 0.4)',
              borderColor: 'var(--border-light)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(57, 17, 125, 0.08)'
            }}
            title="Settings"
          >
            <Settings size={18} strokeWidth={2} />
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2.5 rounded-lg border transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(34, 42, 54, 0.4)',
              borderColor: 'var(--border-light)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(57, 17, 125, 0.08)'
            }}
            title="Logout"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
