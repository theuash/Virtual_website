import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TIER_LABELS } from '../../utils/roleGuards';
import { LayoutDashboard, FolderKanban, DollarSign, TrendingUp, MessageSquare, Settings, LogOut, Menu, X, BookOpen, Video, Users, ChevronLeft, ChevronRight, MoreHorizontal, Info } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';
import AvatarCircle, { resolveAvatar } from '../../components/common/AvatarCircle';
import { useSidebar } from '../../context/SidebarContext';

export default function FreelancerLayout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { collapsed, setCollapsed } = useSidebar();

  const handleLogout = () => { logout(); navigate('/login'); };

  const tier = user?.tier || 'precrate';
  const isCratePlus = ['crate', 'project_initiator', 'momentum_supervisor', 'admin'].includes(tier);

  const mainNavItems = [
    { path: '/freelancer/dashboard', icon: <LayoutDashboard size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { path: '/freelancer/tasks',     icon: <FolderKanban size={17} strokeWidth={1.5} />,    label: 'Projects' },
    ...(isCratePlus ? [{ path: '/freelancer/team', icon: <Users size={17} strokeWidth={1.5} />, label: 'My Team' }] : []),
    { path: '/freelancer/learning',  icon: <BookOpen size={17} strokeWidth={1.5} />,        label: 'Learning' },
    { path: '/freelancer/meet',      icon: <Video size={17} strokeWidth={1.5} />,           label: 'Meet' },
    { path: '/freelancer/earnings',  icon: <DollarSign size={17} strokeWidth={1.5} />,      label: 'Earnings' },
    { path: '/freelancer/messages',  icon: <MessageSquare size={17} strokeWidth={1.5} />,   label: 'Messages' },
  ];

  const accountNavItems = [
    { path: '/freelancer/progress',  icon: <TrendingUp size={17} strokeWidth={1.5} />,      label: 'Career' },
    { path: '/freelancer/settings',  icon: <Settings size={17} strokeWidth={1.5} />,        label: 'Settings' },
    { path: '/freelancer/info',      icon: <Info size={17} strokeWidth={1.5} />,            label: 'Info' },
  ];

  // Bottom bar shows first 4 items + "More"
  const bottomBarItems = mainNavItems.slice(0, 4);
  const drawerItems = mainNavItems.slice(4);

  const initial = (user?.fullName || 'F').charAt(0).toUpperCase();
  const tierLabel = user?.tier ? TIER_LABELS[user.tier] : 'Precrate';

  return (
    <div className="dashboard-layout" style={{ '--sidebar-width': collapsed ? '4rem' : '15rem' }}>
      {/* Mobile toggle — hidden on mobile via CSS */}
      <button
        className="mobile-sidebar-toggle md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ width: collapsed ? '4rem' : undefined, transition: 'width 0.25s ease', overflow: 'hidden' }}>
        {/* Logo + collapse toggle */}
        <div className="px-3 pt-5 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          {!collapsed && (
            <div className="flex items-end cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="V" className="w-7 h-7"
                style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }} />
              <span className="font-black text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em', marginLeft: '1px' }}>
                irtual
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="V" className="w-7 h-7"
                style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }} />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg transition-all hover:scale-110 shrink-0"
              style={{ color: 'var(--text-secondary)' }} title="Collapse sidebar">
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg transition-all hover:scale-110"
              style={{ color: 'var(--text-secondary)' }} title="Expand sidebar">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* User card - hidden when collapsed */}
        {!collapsed && (
          <div className="px-3 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => { setSidebarOpen(false); navigate('/freelancer/profile'); }}
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {user?.avatar ? (
                <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={36} />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.fullName || 'Freelancer'}
                </div>
                <div className="text-[9px] uppercase tracking-widest font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block"
                  style={{ background: 'var(--accent)', color: '#fff', opacity: 0.9 }}>
                  {tierLabel}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed: just avatar */}
        {collapsed && (
          <div className="flex justify-center py-3 cursor-pointer hover:opacity-80 transition-opacity"
               onClick={() => { setSidebarOpen(false); navigate('/freelancer/profile'); }}
               title="View Profile">
            {user?.avatar ? (
              <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={36} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {initial}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Main</div>}
           {mainNavItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {!collapsed && <div className="text-[9px] font-black uppercase tracking-widest px-3 py-2 mt-3" style={{ color: 'var(--text-secondary)' }}>Account</div>}
          {collapsed && <div className="my-2 border-t" style={{ borderColor: 'var(--border)' }} />}
          {accountNavItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleLogout}
            className={`nav-link w-full text-left ${collapsed ? 'justify-center px-2' : ''}`}
            style={{ color: '#ef4444' }}
            title={collapsed ? 'Logout' : undefined}>
            <LogOut size={17} strokeWidth={1.5} className="opacity-70" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="mobile-bottom-nav">
        {bottomBarItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-mobile`}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <button onClick={() => setMoreOpen(true)}>
          <span className="mobile-nav-icon"><MoreHorizontal size={17} strokeWidth={1.5} /></span>
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
              {user?.avatar ? (
                <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={36} />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: 'var(--accent)', color: '#fff' }}>{initial}</div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Freelancer'}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>{tierLabel}</div>
              </div>
            </div>

            {drawerItems.length > 0 && (
              <>
                <div className="mobile-more-drawer-section-label">Navigation</div>
                <div className="mobile-more-drawer-grid">
                  {drawerItems.map(item => (
                    <NavLink key={item.path} to={item.path}
                      id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-mobile`}
                      className={({ isActive }) => isActive ? 'active-mobile' : ''}
                      onClick={() => setMoreOpen(false)}>
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            <div className="mobile-more-drawer-section-label">Account</div>
            <div className="mobile-more-drawer-grid">
              {accountNavItems.map(item => (
                <NavLink key={item.path} to={item.path}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-mobile`}
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
