import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TIER_LABELS } from '../../utils/roleGuards';
import { LayoutDashboard, CheckSquare, DollarSign, TrendingUp, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';

export default function FreelancerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/freelancer/dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/freelancer/tasks', icon: <CheckSquare size={18} strokeWidth={1.5} />, label: 'Tasks' },
    { path: '/freelancer/earnings', icon: <DollarSign size={18} strokeWidth={1.5} />, label: 'Earnings' },
    { path: '/freelancer/progress', icon: <TrendingUp size={18} strokeWidth={1.5} />, label: 'Career Matrix' },
    { path: '/freelancer/messages', icon: <MessageSquare size={18} strokeWidth={1.5} />, label: 'Messages' },
    { path: '/freelancer/settings', icon: <Settings size={18} strokeWidth={1.5} />, label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-glass-card border border-glass-border rounded-lg text-text-primary"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-bloom to-electric-blue flex items-center justify-center font-bold text-white shadow-glow-sm">V</div>
            <span className="font-semibold tracking-tight text-lg text-white">Virtual</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-medium text-sm">
              {user?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="font-medium text-sm text-white">{user?.name}</div>
              <div className="text-[10px] text-violet-light/80 tracking-widest uppercase font-medium mt-0.5">{user?.tier ? TIER_LABELS[user.tier] : 'Talent'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <button onClick={handleLogout} className="nav-link w-full text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
            <LogOut size={18} strokeWidth={1.5} className="opacity-80" /> <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="max-w-6xl mx-auto py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
