import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GetStartedModal from './GetStartedModal';
import logo from '../../assets/logo.png';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  // Scroll reveals
  const headerOpacity = useTransform(scrollY, [100, 400], [0, 1]);
  const headerY = useTransform(scrollY, [100, 400], [-80, 0]);

  useEffect(() => {
    // Initial theme check
    const isLight = document.documentElement.classList.contains('light');
    setIsDark(!isLight);

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
    };
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        className="header-main"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: headerOpacity,
          y: headerY,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid var(--border)'
            : '1px solid transparent',
          padding: '0 2rem',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
        >
          <div style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={logo} alt="Virtual Logo" style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              // Dynamic Violet Filter (Adapts to theme for visibility)
              filter: isDark
                ? 'invert(42%) sepia(90%) saturate(1600%) hue-rotate(230deg) brightness(90%) contrast(100%) shadow(0 0 10px rgba(99,102,241,0.3))'
                : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(40%) contrast(100%)'
            }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.06em', marginLeft: '-15px' }}>
            irtual
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['How It Works', 'how-it-works'], ['Roles', 'roles'], ['Pricing', 'stats']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                fontFamily: 'inherit', fontSize: '1rem', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s',
                padding: '0.5rem 0',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Action Group */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle shadow-glow-sm"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>

          <button id="header-get-started" className="btn-primary" onClick={() => setModalOpen(true)}>
            Get Started
          </button>
        </div>
      </motion.header>

      <GetStartedModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
