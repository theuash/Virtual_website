import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LayoutDashboard, Users, Folder, Scale, Award, Settings, LogOut, Menu, X, MoreHorizontal, Info } from 'lucide-react';
import logo from '../../../assets/logo.png';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNav = [
    { path: '/admin/dashboard',   icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Overview' },
    { path: '/admin/users',       icon: <Users size={18} strokeWidth={1.5} />,           label: 'All Users' },
    { path: '/admin/projects',    icon: <Folder size={18} strokeWidth={1.5} />,          label: 'Projects' },
    { path: '/admin/disputes',    icon: <Scale size={18} strokeWidth={1.5} />,           label: 'Disputes' },
    { path: '/admin/promotions',  icon: <Award size={18} strokeWidth={1.5} />,           label: 'Tier Promotions' },
  ];

  const accountNav = [
    { path: '/admin/settings',    icon: <Settings size={18} strokeWidth={1.5} />,        label: 'Settings' },
    { path: '/admin/info',        icon: <Info size={18} strokeWidth={1.5} />,            label: 'Info' },
  ];

  const allNavItems = [...mainNav, ...accountNav];

  // Bottom bar: first 4 items + "More"
  const bottomBarItems = allNavItems.slice(0, 4);
  const drawerItems = allNavItems.slice(4);

  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">

      {/* Mobile toggle — hidden on mobile via CSS */}
      <button
        className="mobile-sidebar-toggle md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="Virtual Ops" className="w-8 h-8" />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>Ops</span>
          </div>

          <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-xl transition-colors"
            onClick={() => { setSidebarOpen(false); navigate('/admin/profile'); }}>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Administrator</div>
              <div className="text-[10px] tracking-widest uppercase font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Main</div>
          {mainNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group transition-all ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? {
                backgroundColor: 'var(--accent)',
                color: 'white'
              } : {}}
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

          <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2 mt-3" style={{ color: 'var(--text-secondary)' }}>Account</div>
          {accountNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link group transition-all ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? {
                backgroundColor: 'var(--accent)',
                color: 'white'
              } : {}}
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleLogout} className="nav-link w-full text-left transition-colors" style={{ color: '#ef4444' }}>
            <LogOut size={18} strokeWidth={1.5} className="opacity-70" /> <span className="text-sm font-medium">Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="max-w-6xl mx-auto py-8">
          <Outlet />
        </div>
      </main>

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
          <span className="mobile-nav-icon"><MoreHorizontal size={18} strokeWidth={1.5} /></span>
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
            <div className="mobile-more-drawer-user cursor-pointer" onClick={() => { setMoreOpen(false); navigate('/admin/profile'); }}>
              <div className="w-9 h-9 rounded-full border flex items-center justify-center font-medium text-sm shrink-0"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                {initial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>Administrator</div>
                <div className="text-[10px] tracking-widest uppercase font-medium" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>

            <div className="mobile-more-drawer-section-label">More Options</div>
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

            <button className="mobile-more-drawer-logout" onClick={() => { setMoreOpen(false); handleLogout(); }}>
              <LogOut size={16} strokeWidth={1.5} />
              Terminate Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}
