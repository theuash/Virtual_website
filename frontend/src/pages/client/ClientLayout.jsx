import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, Folder, CreditCard, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/client/dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/client/post-project', icon: <PlusCircle size={18} strokeWidth={1.5} />, label: 'Post Project' },
    { path: '/client/projects', icon: <Folder size={18} strokeWidth={1.5} />, label: 'My Projects' },
    { path: '/client/payments', icon: <CreditCard size={18} strokeWidth={1.5} />, label: 'Payments' },
    { path: '/client/messages', icon: <MessageSquare size={18} strokeWidth={1.5} />, label: 'Messages' },
    { path: '/client/settings', icon: <Settings size={18} strokeWidth={1.5} />, label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="Virtual" className="w-8 h-8" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="text-[10px] tracking-widest uppercase font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>Client Account</div>
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

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleLogout} className="nav-link w-full text-left transition-colors" style={{ color: '#ef4444' }}>
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
