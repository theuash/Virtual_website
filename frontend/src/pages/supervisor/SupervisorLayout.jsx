import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare,
  Settings, LogOut, Menu, X, DollarSign, Wallet,
  Bell, Users2, Globe, Briefcase, TrendingUp, Video,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupervisorLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = (user?.fullName || 'S').charAt(0).toUpperCase();

  // Fetch urgent notifications
  useEffect(() => {
    api.get('/supervisor/notifications')
      .then(res => setNotifications(res.data?.data ?? []))
      .catch(() => {});
  }, []);

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
  ];

  const accountNav = [
    { path: '/supervisor/messages', icon: <MessageSquare size={17} strokeWidth={1.5} />, label: 'Messages' },
    { path: '/supervisor/settings', icon: <Settings size={17} strokeWidth={1.5} />,      label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      <button className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
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

          {/* User card + notification bell */}
          <div className="flex items-center gap-3 p-3 rounded-xl border"
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
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setShowNotif(v => !v)}
                className="p-1.5 rounded-lg transition-all hover:scale-110"
                style={{ color: notifications.length > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                <Bell size={15} strokeWidth={1.5} />
              </button>
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </div>
          </div>

          {/* Notification dropdown */}
          <AnimatePresence>
            {showNotif && notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-2 rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="px-3 py-2 border-b text-[10px] font-black uppercase tracking-widest"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Urgent Projects
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <button key={i} onClick={() => { navigate(`/supervisor/projects`); setShowNotif(false); }}
                      className="w-full flex items-start gap-2 px-3 py-2.5 text-left border-b last:border-b-0 hover:opacity-80 transition-opacity"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.timeSensitive ? '#ef4444' : '#f59e0b' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {n.timeSensitive ? ' Time Sensitive' : ' Consultancy'}  {n.clientId?.company || n.clientId?.fullName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
    </div>
  );
}
