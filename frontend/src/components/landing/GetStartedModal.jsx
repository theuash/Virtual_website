import { useNavigate } from 'react-router-dom';
import { X, Target, Briefcase } from 'lucide-react';

export default function GetStartedModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, background: '#0a0a0f' }}>
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors">
          <X size={20} strokeWidth={1.5} />
        </button>

        <h2 className="text-2xl font-medium tracking-tight text-white mb-2 text-center">
          Experience Virtual
        </h2>
        <p className="text-text-muted text-center text-sm font-light mb-10">
          Select your portal to continue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { onClose(); navigate('/signup?role=client'); }}
            className="group relative p-6 bg-glass-card border border-glass-border rounded-2xl text-left hover:border-electric-blue/50 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-blue-900/20 text-electric-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Target size={20} strokeWidth={1.5} />
            </div>
            <div className="font-medium text-white mb-1.5 text-sm">Hire Talent</div>
            <div className="text-xs text-text-muted font-light leading-relaxed">
              Source highly vetted creatives for your next campaign.
            </div>
          </button>

          <button
            onClick={() => { onClose(); navigate('/signup?role=freelancer'); }}
            className="group relative p-6 bg-glass-card border border-glass-border rounded-2xl text-left hover:border-violet-light/50 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-violet-900/20 text-violet-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Briefcase size={20} strokeWidth={1.5} />
            </div>
            <div className="font-medium text-white mb-1.5 text-sm">Join as Talent</div>
            <div className="text-xs text-text-muted font-light leading-relaxed">
               Work on premium projects and scale your career ladder.
            </div>
          </button>
        </div>

        <p className="text-center mt-8 text-xs text-text-muted font-light">
          Already a member?{' '}
          <button onClick={() => { onClose(); navigate('/login'); }} className="text-white font-medium hover:text-violet-300 transition-colors">
             Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
