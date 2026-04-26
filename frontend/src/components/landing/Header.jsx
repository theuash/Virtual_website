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
  const headerY = useTransform(smoothScrollY, [50, 200], [-64, 0]);

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

  const logoFilter = isDark
    ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)'
    : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)';

  return (
    <>
      <motion.header
        className="header-main"
        style={isLanding
          ? { opacity: headerOpacity, y: headerY }
          : { opacity: 1, y: 0 }
        }
        css-vars="true"
      >
        <style>{`
          .header-main {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 100;
            background: var(--bg-glass);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: ${scrolled ? '1px solid var(--border)' : '1px solid transparent'};
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            height: 80px;
          }
          @media (max-width: 767px) {
            .header-main {
              height: 56px;
              padding: 0 1rem;
              opacity: ${headerVisible ? '1' : '0'} !important;
              transform: translateY(${headerVisible ? '0' : '-56px'}) !important;
              transition: opacity 0.3s ease, transform 0.3s ease;
              pointer-events: ${headerVisible ? 'auto' : 'none'};
            }
          }
        `}</style>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}>
          <img src={logo} alt="Virtual Logo" style={{
            width: 'clamp(28px, 36px, 44px)',
            height: 'clamp(28px, 36px, 44px)',
            objectFit: 'contain',
            flexShrink: 0,
            marginBottom: '2px',
            filter: logoFilter,
          }} />
          <span style={{
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 1.4rem, 1.5rem)',
            lineHeight: 1,
            color: 'var(--text-primary)',
            letterSpacing: '-0.06em',
            marginBottom: '4px',
            marginLeft: '-6px',
          }}>
            irtual
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex" style={{ gap: '2rem', alignItems: 'center' }}>
          {[
            ['How It Works', '/how-it-works'],
            ['Roles', '/roles'],
            ['Pricing', '/pricing'],
            ['About', '/about'],
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* CountrySelector — desktop only */}
          <div className="hidden md:block">
            <CountrySelector />
          </div>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: 36, height: 36,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop auth buttons */}
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
          <div className="hidden md:block">
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu — slides down from header */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.4)', top: 56 }}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-0 right-0 z-50 md:hidden"
              style={{
                top: 56,
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="p-3 flex flex-col gap-1">
                {[
                  ['How It Works', '/how-it-works'],
                  ['Roles', '/roles'],
                  ['Pricing', '/pricing'],
                  ['About', '/about'],
                ].map(([label, path]) => (
                  <button key={path} onClick={() => handleNavClick(path)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-colors"
                    style={{
                      color: location.pathname === path ? 'var(--accent)' : 'var(--text-primary)',
                      fontSize: '0.9rem', fontWeight: 500,
                      background: location.pathname === path ? 'rgba(110,44,242,0.08)' : 'transparent',
                    }}>
                    {label}
                  </button>
                ))}

                <div className="flex gap-2 pt-2 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => handleNavClick('/login')}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Log In
                  </button>
                  <button onClick={() => handleNavClick('/signup')}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}>
                    Get Started
                  </button>
                </div>

                {/* Country selector in mobile menu */}
                <div className="pt-2">
                  <CountrySelector />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
