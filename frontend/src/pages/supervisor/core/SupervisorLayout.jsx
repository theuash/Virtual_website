import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare,
  Settings, LogOut, Menu, X, DollarSign, Wallet,
  Users2, Globe, Briefcase, TrendingUp, Video, MoreHorizontal, Info, ShieldCheck
} from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupervisorLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = (user?.fullName || 'S').charAt(0).toUpperCase();

  const mainNav = [
    { path: '/supervisor/dashboard',      icon: <LayoutDashboard size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/supervisor/projects',       icon: <FolderKanban size={17} strokeWidth={1.5} />,   label: 'Projects' },
    { path: '/supervisor/teams',          icon: <Users size={17} strokeWidth={1.5} />,           label: 'Teams' },
    { path: '/supervisor/precrates',      icon: <Users2 size={17} strokeWidth={1.5} />,          label: 'Precrates' },
    { path: '/supervisor/meetings',       icon: <Video size={17} strokeWidth={1.5} />,            label: 'Meetings' },
    { path: '/supervisor/group-projects', icon: <Globe size={17} strokeWidth={1.5} />,           label: 'Group Projects' },
    { path: '/supervisor/clients',        icon: <Briefcase size={17} strokeWidth={1.5} />,       label: 'Clients' },
    { path: '/supervisor/payouts',        icon: <DollarSign size={17} strokeWidth={1.5} />,      label: 'Payouts' },
    { path: '/supervisor/earnings',       icon: <TrendingUp size={17} strokeWidth={1.5} />,      label: 'Earnings' },
    { path: '/supervisor/wallet',         icon: <Wallet size={17} strokeWidth={1.5} />,          label: 'Wallet' },
    { path: '/supervisor/messages',            icon: <MessageSquare size={17} strokeWidth={1.5} />,   label: 'Messages' },
    { path: '/supervisor/verification-portal', icon: <ShieldCheck size={17} strokeWidth={1.5} />,     label: 'Verification Portal' },
  ];

  const accountNav = [
    { path: '/supervisor/settings', icon: <Settings size={17} strokeWidth={1.5} />,      label: 'Settings' },
    { path: '/supervisor/info',     icon: <Info size={17} strokeWidth={1.5} />,          label: 'Info' },
  ];

  const allNavItems = [...mainNav, ...accountNav];

  // Bottom bar: first 4 main items + "More"
  const bottomBarItems = allNavItems.slice(0, 4);
  const drawerItems = allNavItems.slice(4);

  return (
    <div className="dashboard-layout">
      {/* Mobile toggle — hidden on mobile via CSS */}
      <button className="mobile-sidebar-toggle md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-end mb-5 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="V" className="w-7 h-7"
              style={{ filter: isDark ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)' : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)' }} />
            <span className="font-black text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em', marginLeft: '1px' }}>
              irtual
            </span>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            onClick={() => { setSidebarOpen(false); navigate('/supervisor/profile'); }}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: '#f59e0b', color: '#fff' }}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || 'Supervisor'}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
                style={{ color: '#f59e0b' }}>
                Momentum Supervisor
              </div>
            </div>
          </div>


        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Main</div>
          {mainNav.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2 mt-3" style={{ color: 'var(--text-secondary)' }}>Account</div>
          {accountNav.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
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

      <main className="dashboard-main"><Outlet /></main>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="mobile-bottom-nav">
        {bottomBarItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <button onClick={() => setMoreOpen(true)}>
          <span className="mobile-nav-icon" style={{ position: 'relative' }}>
            <MoreHorizontal size={17} strokeWidth={1.5} />
          </span>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {/* ── More Drawer ── */}
      {moreOpen && (
        <>
          <div className="mobile-more-drawer-overlay" onClick={() => setMoreOpen(false)} />
          <div className="mobile-more-drawer">
            <div className="mobile-more-drawer-handle" />

            {/* User info */}
            <div className="mobile-more-drawer-user">
              <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => { setMoreOpen(false); navigate('/supervisor/profile'); }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: '#f59e0b', color: '#fff' }}>{initial}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Supervisor'}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#f59e0b' }}>Momentum Supervisor</div>
                </div>
              </div>
            </div>

            <div className="mobile-more-drawer-section-label">Navigation</div>
            <div className="mobile-more-drawer-grid">
              {drawerItems.map(item => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => isActive ? 'active-mobile' : ''}
                  onClick={() => setMoreOpen(false)}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mobile-more-drawer-section-label">Account</div>
            <div className="mobile-more-drawer-grid">
              {accountNav.map(item => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => isActive ? 'active-mobile' : ''}
                  onClick={() => setMoreOpen(false)}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>

            <button className="mobile-more-drawer-logout" onClick={() => { setMoreOpen(false); handleLogout(); }}>
              <LogOut size={16} strokeWidth={1.5} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
