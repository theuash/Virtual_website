import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, MessageSquare, Settings, LogOut, Menu, X, Users } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';

export default function SupervisorLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/supervisor/dashboard', icon: <LayoutDashboard size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/supervisor/freelancers', icon: <Users size={17} strokeWidth={1.5} />,         label: 'Freelancers' },
    { path: '/supervisor/messages',   icon: <MessageSquare size={17} strokeWidth={1.5} />,  label: 'Messages' },
    { path: '/supervisor/settings',   icon: <Settings size={17} strokeWidth={1.5} />,       label: 'Settings' },
  ];

  const initial = (user?.fullName || 'S').charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-5 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Virtual" className="w-6 h-6"
              style={{ filter: 'invert(50%) sepia(80%) saturate(1500%) hue-rotate(240deg) brightness(100%) contrast(100%)' }} />
            <span className="font-black text-base" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>
              irtual
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-glow-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || 'Supervisor'}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-black mt-0.5"
                style={{ color: 'var(--accent)' }}>
                Momentum Supervisor
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleLogout} className="nav-link w-full text-left" style={{ color: '#ef4444' }}>
            <LogOut size={17} strokeWidth={1.5} className="opacity-70" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
