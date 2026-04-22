import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, Folder, CreditCard, MessageSquare, Settings, LogOut, Menu, X, Wallet, Video } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/client/dashboard',    icon: <LayoutDashboard size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/client/post-project', icon: <PlusCircle size={17} strokeWidth={1.5} />,      label: 'Post Project' },
    { path: '/client/projects',     icon: <Folder size={17} strokeWidth={1.5} />,          label: 'My Projects' },
    { path: '/client/wallet',       icon: <Wallet size={17} strokeWidth={1.5} />,          label: 'Wallet' },
    { path: '/client/meet',         icon: <Video size={17} strokeWidth={1.5} />,           label: 'Meet' },
    { path: '/client/payments',     icon: <CreditCard size={17} strokeWidth={1.5} />,      label: 'Payments' },
    { path: '/client/messages',     icon: <MessageSquare size={17} strokeWidth={1.5} />,   label: 'Messages' },
    { path: '/client/settings',     icon: <Settings size={17} strokeWidth={1.5} />,        label: 'Settings' },
  ];

  const initial = (user?.fullName || 'C').charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo + user */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-end mb-6">
            <img
              src={logo}
              alt="V"
              className="w-7 h-7"
              style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
            />
            <span className="font-black text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em', marginLeft: '1px' }}>
              irtual
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || 'Client'}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-secondary)' }}>
                {user?.companyName || 'Client Account'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleLogout}
            className="nav-link w-full text-left"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={17} strokeWidth={1.5} className="opacity-70" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
