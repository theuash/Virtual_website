import { useNavigate } from 'react-router-dom';
import { X, Target, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GetStartedModal({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <div className="modal-overlay">
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-box p-8 md:p-10 relative z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                Begin Your Journey
              </h2>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Select the path that matches your goals.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Hire */}
              <button
                onClick={() => { onClose(); navigate('/signup?role=client'); }}
                className="modal-option-card group w-full"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" 
                       style={{ background: 'rgba(37,99,237,0.1)', color: 'var(--accent)' }}>
                    <Target size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-0.5" style={{ color: 'var(--text-primary)' }}>Hire Elite Talent</div>
                    <div className="text-xs font-light" style={{ color: 'var(--text-secondary)' }}>
                      Access the world's top 1% creative specialists.
                    </div>
                  </div>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                </div>
              </button>

              {/* Option 2: Join */}
              <button
                onClick={() => { onClose(); navigate('/signup?role=freelancer'); }}
                className="modal-option-card group w-full"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" 
                       style={{ background: 'rgba(27,48,34,0.1)', color: '#10B981' }}>
                    <Briefcase size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-0.5" style={{ color: 'var(--text-primary)' }}>Join as Talent</div>
                    <div className="text-xs font-light" style={{ color: 'var(--text-secondary)' }}>
                      Work on premium projects and grow your career.
                    </div>
                  </div>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                </div>
              </button>
            </div>

            <div className="text-center mt-10 pt-8 border-t border-white/[0.05]">
              <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                Already a member?{' '}
                <button 
                  onClick={() => { onClose(); navigate('/login'); }} 
                  className="font-semibold hover:underline transition-all" 
                  style={{ color: 'var(--accent)' }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

