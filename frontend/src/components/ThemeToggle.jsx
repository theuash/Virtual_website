import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${className}`}
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute"
        >
          {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
