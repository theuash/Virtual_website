import { useNavigate } from 'react-router-dom';
import { X, Target, Briefcase } from 'lucide-react';

export default function GetStartedModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-box relative overflow-hidden" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: 520, 
          background: 'var(--bg-primary)',
          borderColor: 'var(--border)'
        }}
      >
        <button onClick={onClose} className="absolute top-6 right-6 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <X size={20} strokeWidth={1.5} />
        </button>

        <h2 className="text-2xl font-medium tracking-tight mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
          Experience Virtual
        </h2>
        <p className="text-center text-sm font-light mb-10" style={{ color: 'var(--text-secondary)' }}>
          Select your portal to continue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { onClose(); navigate('/signup?role=client'); }}
            className="group relative p-6 border rounded-2xl text-left transition-all duration-300"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(96,10,10,0.1)', color: 'var(--accent)' }}>
               <Target size={20} strokeWidth={1.5} />
            </div>
            <div className="font-medium mb-1.5 text-sm" style={{ color: 'var(--text-primary)' }}>Hire Talent</div>
            <div className="text-xs font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Source highly vetted creatives for your next campaign.
            </div>
          </button>

          <button
            onClick={() => { onClose(); navigate('/signup?role=freelancer'); }}
            className="group relative p-6 border rounded-2xl text-left transition-all duration-300"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'var(--forest)', color: '#F0F2EF', opacity: 0.9 }}>
               <Briefcase size={20} strokeWidth={1.5} />
            </div>
            <div className="font-medium mb-1.5 text-sm" style={{ color: 'var(--text-primary)' }}>Join as Talent</div>
            <div className="text-xs font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
               Work on premium projects and scale your career ladder.
            </div>
          </button>
        </div>

        <p className="text-center mt-8 text-xs font-light" style={{ color: 'var(--text-secondary)' }}>
          Already a member?{' '}
          <button onClick={() => { onClose(); navigate('/login'); }} className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
             Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
