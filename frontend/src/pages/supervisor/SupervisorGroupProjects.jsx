import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import { Globe, Loader2, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

function ProgressBar({ approved, total }) {
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Task Progress</span>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{approved}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f59e0b' }} />
      </div>
    </div>
  );
}

function GroupProjectCard({ project, index }) {
  const summary = project.taskSummary || { total: 0, approved: 0 };
  const coInitiators = project.coInitiators || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#f59e0b' }} />
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe size={12} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>Group Project</span>
            </div>
            <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {project.clientId?.fullName || '-'}  {project.clientId?.company || ''}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
            {project.status || 'open'}
          </span>
        </div>

        {/* Co-initiators */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
            Co-Initiators ({coInitiators.length})
          </p>
          {coInitiators.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>None assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {coInitiators.map((ci, i) => (
                <div key={ci._id || i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-card)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                    style={{ background: '#f59e0b', color: '#fff' }}>
                    {(ci.fullName || 'I').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{ci.fullName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <ProgressBar approved={summary.approved} total={summary.total} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-lg font-black" style={{ color: '#f59e0b' }}>{summary.total}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Total Tasks</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-lg font-black" style={{ color: '#10b981' }}>{summary.approved}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Approved</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SupervisorGroupProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.get('/supervisor/group-projects')
      .then(res => setProjects(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load group projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardHeader title="Group Projects" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No group projects yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Group projects with multiple co-initiators will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <GroupProjectCard key={p._id} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

