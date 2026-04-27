import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Settings, LogOut, Bell, X, CreditCard, Zap, Package, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function DashboardHeader({ title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Map roles to their specific notification endpoints
  const endpointMap = {
    momentum_supervisor: '/supervisor/notifications',
    project_initiator:   '/initiator/notifications', // Placeholder for future
    crate:               '/freelancer/notifications', // Placeholder for future
    precrate:            '/freelancer/notifications', // Placeholder for future
    client:              '/client/notifications',     // Placeholder for future
    admin:               '/admin/notifications'       // Placeholder for future
  };

  const notificationEndpoint = endpointMap[user?.role] || '/notifications';

  const { data: liveNotifs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', user?.role, user?._id],
    queryFn: async () => {
      try {
        const res = await api.get(notificationEndpoint);
        const data = res.data?.data ?? [];
        
        // Normalize different notification shapes from backend
        return data.map(item => {
          // If it's a project from /supervisor/notifications
          if (item._id && item.title && item.clientId) {
            return {
              id: item._id,
              type: item.timeSensitive ? 'urgent' : 'project',
              title: item.title,
              desc: `${item.clientId?.company || item.clientId?.fullName} - ${item.category || 'Consultancy'}`,
              time: 'Live',
              unread: true,
              icon: item.timeSensitive ? <AlertCircle size={14} className="text-red-500" /> : <Package size={14} className="text-blue-500" />,
              link: `/${user?.role}/projects`
            };
          }
          return item;
        });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = liveNotifs.filter(n => n.unread).length;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p className="text-[10px] sm:text-xs mt-0.5 opacity-60" style={{ color: 'var(--text-secondary)' }}>
            Welcome, {user?.fullName || 'User'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 rounded-xl border transition-all hover:scale-105 relative"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <Bell size={16} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2" style={{ borderColor: 'var(--bg-glass)' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown (Wide) */}
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-[320px] sm:w-[420px] rounded-2xl border shadow-2xl overflow-hidden"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                >
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                        System Notifications
                      </h3>
                      {isLoading && <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <button onClick={() => setShowNotifs(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <div className="p-10 space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-white/5" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/3 bg-white/5 rounded" />
                              <div className="h-2 w-full bg-white/5 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isError || liveNotifs.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                          <Bell size={24} className="opacity-20" />
                        </div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No active notifications</p>
                        <p className="text-[10px] mt-1 opacity-40" style={{ color: 'var(--text-secondary)' }}>You're all caught up with the system.</p>
                      </div>
                    ) : (
                      liveNotifs.map((n) => (
                        <div
                          key={n.id}
                          className="p-4 border-b last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                          style={{ borderColor: 'var(--border)' }}
                          onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}
                        >
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                              {n.icon || <Info size={14} className="opacity-40" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-bold truncate pr-4" style={{ color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {n.title}
                                </h4>
                                <span className="text-[9px] opacity-40 uppercase font-black shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] leading-snug opacity-60 mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
                                {n.desc}
                              </p>
                              <div className="flex gap-2">
                                <button className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-accent/10 text-accent transition-all ring-1 ring-accent/20">View Action</button>
                                <button className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded hover:bg-white/5 opacity-40 hover:opacity-100 transition-all">Dismiss</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-black/5 dark:bg-white/5 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                    <button 
                      onClick={() => refetch()}
                      className="text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 mx-auto"
                    >
                      <Zap size={10} /> Sync with Server
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border transition-all hover:scale-105"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </button>

          <button
            onClick={() => navigate(`/${user?.role}/settings`)}
            className="p-2.5 rounded-xl border transition-all hover:scale-105"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            title="Settings"
          >
            <Settings size={16} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2.5 rounded-xl border transition-all hover:scale-105"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            title="Logout"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
