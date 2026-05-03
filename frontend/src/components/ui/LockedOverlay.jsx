import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Full-page lock overlay for precrate users.
 * Wrap any page content with this when tier === 'precrate'.
 */
export default function LockedOverlay({ title = 'Locked', message, unlockAt = 'Crate' }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Blurred background hint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Lock card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-8 py-12 rounded-2xl border max-w-[24rem] mx-auto"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Animated lock icon */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Lock size={28} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        </motion.div>

        {/* Glow ring */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.12 }}
        />

        <div
          className="text-[9px] font-black uppercase tracking-widest mb-2"
          style={{ color: 'var(--accent)' }}
        >
          Precrate Restriction
        </div>

        <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>

        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message || `This section unlocks when you reach the ${unlockAt} tier. Complete your learning modules and submit your first project to advance.`}
        </p>

        {/* Tier progress hint */}
        <div
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-5"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-left">
            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Current
            </div>
            <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Precrate</div>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-secondary)' }} />
          <div className="text-right">
            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Unlocks at
            </div>
            <div className="text-sm font-black" style={{ color: 'var(--accent)' }}>{unlockAt}</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/freelancer/learning')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Go to Learning <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
}
