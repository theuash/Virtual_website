import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Folder, Scale, Award, Settings, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Overview' },
    { path: '/admin/users', icon: <Users size={18} strokeWidth={1.5} />, label: 'All Users' },
    { path: '/admin/projects', icon: <Folder size={18} strokeWidth={1.5} />, label: 'Projects' },
    { path: '/admin/disputes', icon: <Scale size={18} strokeWidth={1.5} />, label: 'Disputes' },
    { path: '/admin/promotions', icon: <Award size={18} strokeWidth={1.5} />, label: 'Tier Promotions' },
    { path: '/admin/settings', icon: <Settings size={18} strokeWidth={1.5} />, label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout bg-zinc-950">
      
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg text-text-primary"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar bg-[#09090b] border-zinc-900 ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white shadow-sm">A</div>
            <span className="font-semibold tracking-tight text-lg text-white">Virtual <span className="text-zinc-500 font-light text-xs ml-1 uppercase tracking-widest">Ops</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center justify-center font-medium text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-medium text-sm text-zinc-200">Administrator</div>
              <div className="text-[10px] text-zinc-500 tracking-widest uppercase font-medium mt-0.5">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group !text-zinc-400 hover:!bg-zinc-900/50 hover:!text-zinc-200 ${isActive ? '!bg-zinc-900 !text-white !border-l-2 !border-zinc-700 !rounded-l-none' : ''}`}
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button onClick={handleLogout} className="nav-link w-full text-left !text-zinc-500 hover:!bg-zinc-900 hover:!text-zinc-300 transition-colors">
            <LogOut size={18} strokeWidth={1.5} className="opacity-70" /> <span className="text-sm font-medium">Terminate Session</span>
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
