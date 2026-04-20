import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare,
  Settings, LogOut, Menu, X, DollarSign, Video,
  Globe, Activity, UserCheck,
} from 'lucide-react';
import logo from '../../assets/logo.png';

export default function InitiatorLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = (user?.fullName || 'I').charAt(0).toUpperCase();

  const mainNav = [
    { path: '/initiator/dashboard',     icon: <LayoutDashboard size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/initiator/projects',      icon: <FolderKanban size={17} strokeWidth={1.5} />,   label: 'Projects' },
    { path: '/initiator/clients',       icon: <UserCheck size={17} strokeWidth={1.5} />,       label: 'Clients' },
    { path: '/initiator/open-projects', icon: <Globe size={17} strokeWidth={1.5} />,           label: 'Open Projects' },
    { path: '/initiator/work',          icon: <Activity size={17} strokeWidth={1.5} />,        label: 'Work' },
    { path: '/initiator/meet',          icon: <Video size={17} strokeWidth={1.5} />,           label: 'Meet' },
    { path: '/initiator/earnings',      icon: <DollarSign size={17} strokeWidth={1.5} />,      label: 'Earnings' },
  ];

  const accountNav = [
    { path: '/initiator/messages', icon: <MessageSquare size={17} strokeWidth={1.5} />, label: 'Messages' },
    { path: '/initiator/settings', icon: <Settings size={17} strokeWidth={1.5} />,      label: 'Settings' },
  ];

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
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-5 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Virtual" className="w-6 h-6"
              style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }} />
            <span className="font-black text-base" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>
              irtual
            </span>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || 'Initiator'}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block"
                style={{ background: '#8b5cf622', color: '#8b5cf6' }}>
                Project Initiator
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2"
            style={{ color: 'var(--text-secondary)' }}>Main</div>
          {mainNav.map(item => (
            <NavLink key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2 mt-3"
            style={{ color: 'var(--text-secondary)' }}>Account</div>
          {accountNav.map(item => (
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
