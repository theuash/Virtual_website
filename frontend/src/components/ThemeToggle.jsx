import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

/**
 * Creative pill-style theme toggle.
 * variant="pill"   — sliding pill with sun/moon (landing/auth pages)
 * variant="icon"   — simple icon button (dashboard header, already exists there)
 */
export default function ThemeToggle({ variant = 'pill', className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative flex items-center rounded-full transition-all hover:scale-105 active:scale-95 ${className}`}
        style={{
          width: 56,
          height: 28,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
          padding: 3,
        }}
      >
        {/* Track icons */}
        <span className="absolute left-2 text-[10px]" style={{ opacity: isDark ? 0.3 : 0 }}>🌙</span>
        <span className="absolute right-2 text-[10px]" style={{ opacity: isDark ? 0 : 0.5 }}>☀️</span>

        {/* Sliding thumb */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
          style={{
            background: isDark ? '#fff' : '#1a1a2e',
            marginLeft: isDark ? 0 : 'auto',
            boxShadow: isDark
              ? '0 1px 4px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </motion.div>
      </button>
    );
  }

  // icon variant (used in DashboardHeader)
  return null;
}
