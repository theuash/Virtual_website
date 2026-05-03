import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

/**
 * Wraps a dashboard card/section with a frosted lock overlay.
 * The children are still rendered (visible but blurred) underneath.
 */
export default function LockedBlock({ children, label = 'Unlocks at Crate', className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Actual content - blurred */}
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        {children}
      </div>

      {/* Frosted overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <Lock size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {label}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
