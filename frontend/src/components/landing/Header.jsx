import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useVelocity, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const navigate = useNavigate();
  const location = useLocation();

  // Only animate header in/out on the landing page — always visible elsewhere
  const isLanding = location.pathname === '/';

  const effectiveScroll = useTransform([scrollY, scrollVelocity], ([latestY, latestVel]) => {
    return latestY + (latestVel * 0.2);
  });
  const smoothScrollY = useSpring(effectiveScroll, { stiffness: 150, damping: 25, mass: 0.3 });
  const headerOpacity = useTransform(smoothScrollY, [100, 400], [0, 1]);
  const headerY      = useTransform(smoothScrollY, [100, 400], [-80, 0]);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setIsDark(!isLight);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (!newDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    if (!isLanding) {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    padding: '0 1rem sm:px-8',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <>
      <motion.header
        className="header-main"
        style={
          isLanding
            ? { ...headerStyle, opacity: headerOpacity, y: headerY }
            : { ...headerStyle, opacity: 1, y: 0 }
        }
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
        >
          <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="Virtual Logo" style={{
              width: '100%', height: '100%', objectFit: 'contain',
              filter: isDark
                ? 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(165,129,255,0.3))'
                : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(40%) contrast(100%)'
            }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.5rem sm:text-2xl', color: 'var(--text-primary)', letterSpacing: '-0.06em', marginLeft: '-15px' }}>
            irtual
          </span>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '2rem', alignItems: 'center', '@media (min-width: 768px)': { display: 'flex' } }} className="hidden md:flex">
          {[['How It Works', 'how-it-works'], ['Roles', 'roles']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem 0',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {label}
            </button>
          ))}
          {[
            ['Pricing', '/pricing'],
            ['About',   '/about'],
          ].map(([label, path]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
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
        <div style={{ display: 'flex', gap: '1rem sm:gap-1.5rem', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle shadow-glow-sm p-2 hover:scale-105 transition-transform"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:scale-105 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Get Started */}
          <button 
            id="header-get-started" 
            className="btn-primary hidden sm:block"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-50 md:hidden"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="p-4 space-y-3">
              {[['How It Works', 'how-it-works'], ['Roles', 'roles']].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="w-full text-left px-4 py-2.5 rounded-lg transition-colors hover:bg-[rgba(110,44,242,0.1)]"
                  style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  {label}
                </button>
              ))}
              {[
                ['Pricing', '/pricing'],
                ['About',   '/about'],
              ].map(([label, path]) => (
                <button
                  key={path}
                  onClick={() => handleNavClick(path)}
                  className="w-full text-left px-4 py-2.5 rounded-lg transition-colors hover:bg-[rgba(110,44,242,0.1)]"
                  style={{ 
                    color: location.pathname === path ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: '0.95rem', 
                    fontWeight: 500 
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('/signup')}
                className="w-full py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
