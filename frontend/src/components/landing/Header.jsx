import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useVelocity, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import ThemeToggle from '../ThemeToggle';
import CountrySelector from '../CountrySelector';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark } = useTheme();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const effectiveScroll = useTransform([scrollY, scrollVelocity], ([latestY, latestVel]) => {
    return latestY + (latestVel * 0.2);
  });
  const smoothScrollY = useSpring(effectiveScroll, { stiffness: 150, damping: 25, mass: 0.3 });
  const headerOpacity = useTransform(smoothScrollY, [50, 200], [0, 1]);
  const headerY      = useTransform(smoothScrollY, [50, 200], [-80, 0]);

  useEffect(() => {
    if (!isLanding) return;
    let lastY = 0;
    const unsub = scrollY.on('change', (y) => {
      if (y > 80 && y > lastY) setHeaderVisible(true);
      if (y < 40) setHeaderVisible(false);
      lastY = y;
    });
    return () => unsub();
  }, [scrollY, isLanding]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const headerStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    padding: '0 1.5rem',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <>
      <motion.header
        className="header-main md:block"
        style={
          isLanding
            ? { ...headerStyle, opacity: headerOpacity, y: headerY }
            : { ...headerStyle, opacity: 1, y: 0 }
        }
      >
        <style>{`
          @media (max-width: 767px) {
            .header-main {
              opacity: ${headerVisible ? '1' : '0'} !important;
              transform: translateY(${headerVisible ? '0' : '-80px'}) !important;
              transition: opacity 0.3s ease, transform 0.3s ease;
              pointer-events: ${headerVisible ? 'auto' : 'none'};
            }
          }
        `}</style>

        {/* Logo */}
        <div onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-end', gap: '0' }}>
          <img src={logo} alt="Virtual Logo" style={{
            width: 44, height: 44, objectFit: 'contain', flexShrink: 0, marginBottom: '2px',
            filter: isDark
              ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)'
              : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)',
          }} />
          <span style={{
            fontWeight: 800, fontSize: '1.5rem', lineHeight: 1,
            color: 'var(--text-primary)', letterSpacing: '-0.06em',
            marginBottom: '5px', marginLeft: '-8px',
          }}>
            irtual
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex" style={{ gap: '2rem', alignItems: 'center' }}>
          {[
            ['How It Works', '/how-it-works'],
            ['Roles',        '/roles'],
            ['Pricing',      '/pricing'],
            ['About',        '/about'],
          ].map(([label, path]) => (
            <button key={path} onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none',
                color: location.pathname === path ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem 0',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = location.pathname === path ? 'var(--accent)' : 'var(--text-secondary)'}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <CountrySelector />
          <ThemeToggle  />

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:scale-105 transition-transform"
            style={{ color: 'var(--text-secondary)' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button className="hidden md:block" onClick={() => navigate('/login')}
            style={{
              background: 'none', border: '1px solid var(--border)', color: 'var(--text-primary)',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            Log In
          </button>
          <button className="btn-primary hidden md:block" onClick={() => navigate('/signup')}>
            Get Started
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-50 md:hidden"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <div className="p-4 space-y-3">
              {[
                ['How It Works', '/how-it-works'],
                ['Roles',        '/roles'],
                ['Pricing',      '/pricing'],
                ['About',        '/about'],
              ].map(([label, path]) => (
                <button key={path} onClick={() => handleNavClick(path)}
                  className="w-full text-left px-4 py-2.5 rounded-lg transition-colors hover:bg-[rgba(110,44,242,0.1)]"
                  style={{ color: location.pathname === path ? 'var(--accent)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
                  {label}
                </button>
              ))}
              <button onClick={() => handleNavClick('/login')}
                className="w-full py-2.5 rounded-lg font-semibold"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Log In
              </button>
              <button onClick={() => handleNavClick('/signup')}
                className="w-full py-2.5 rounded-lg font-semibold hover:scale-[1.02] active:scale-95 transition-all"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
