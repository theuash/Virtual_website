import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import { Users2, Loader2, AlertCircle, BookOpen, Clock, Calendar } from 'lucide-react';

const SKILL_LABELS = {
  video_editing: 'Video Editing',
  '3d_animation': '3D Animation',
  cgi: 'CGI / VFX',
  script_writing: 'Script Writing',
  graphic_designing: 'Graphic Design',
};

function LearningBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Learning</span>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{completed}/{total} modules</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f59e0b' }} />
      </div>
    </div>
  );
}

function PrecratCard({ freelancer, index }) {
  const prog = freelancer.learningProgress || { completed: 0, total: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#f59e0b' }} />
      <div className="p-5 space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: '#f59e0b22', color: '#f59e0b' }}>
            {(freelancer.fullName || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {freelancer.fullName || 'Freelancer'}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{freelancer.email}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
            style={{ background: '#f59e0b22', color: '#f59e0b' }}>Precrate</span>
        </div>

        {/* Skill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
          <BookOpen size={12} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {SKILL_LABELS[freelancer.primarySkill] || freelancer.primarySkill || 'No skill set'}
          </span>
        </div>

        {/* Learning progress */}
        <LearningBar completed={prog.completed} total={prog.total} />

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Clock size={10} strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--text-secondary)' }}>Hrs/Week</span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{freelancer.hoursPerWeek || '—'}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Calendar size={10} strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--text-secondary)' }}>Joined</span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {freelancer.createdAt ? new Date(freelancer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SupervisorPrecrates() {
  const [precrates, setPrecrates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    api.get('/supervisor/precrates')
      .then(res => setPrecrates(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load precrates'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardHeader title="Precrates" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <Users2 size={16} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Precrate freelancers are in training. Monitor their learning progress here.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : precrates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users2 size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No precrate freelancers</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Precrate freelancers will appear here once they join the platform.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {precrates.map((f, i) => (
              <PrecratCard key={f._id} freelancer={f} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
