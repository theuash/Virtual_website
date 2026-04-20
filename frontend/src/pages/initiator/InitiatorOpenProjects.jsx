import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  Globe, Tag, DollarSign, Clock, Calendar,
  Loader2, AlertCircle, ArrowRight,
} from 'lucide-react';

const SKILL_LABELS = {
  video_editing: 'Video Editing', '3d_animation': '3D Animation',
  cgi: 'CGI / VFX', script_writing: 'Script Writing', graphic_designing: 'Graphic Design',
};

function Avatar({ name = '?', color = '#3b82f6', size = 6 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-black shrink-0`}
      style={{ background: color, color: '#fff' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function OpenProjectCard({ project, onAccept, accepting }) {
  const posted = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  return (
    <motion.div whileHover={{ y: -2 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#3b82f6' }} />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
            <p className="text-xs mt-0.5 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#3b82f622', color: '#3b82f6' }}>Open</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={10} />{SKILL_LABELS[project.category] || project.category}
          </span>
          {project.openBudget && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign size={10} />Rs.{project.openBudget.toLocaleString('en-IN')}
            </span>
          )}
          {project.durationDays && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={10} />{project.durationDays}d
            </span>
          )}
          {posted && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={10} />Posted {posted}
            </span>
          )}
        </div>

        {project.clientId && (
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <Avatar name={project.clientId.fullName || project.clientId.company || 'C'} />
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {project.clientId.fullName || project.clientId.company || 'Client'}
              </p>
              {project.clientId.company && (
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{project.clientId.company}</p>
              )}
            </div>
          </div>
        )}

        {project.preferredSoftware?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.preferredSoftware.map(s => (
              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{s}</span>
            ))}
          </div>
        )}

        <button onClick={() => onAccept(project._id)} disabled={accepting === project._id}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {accepting === project._id
            ? <Loader2 size={14} className="animate-spin" />
            : <ArrowRight size={14} />}
          {accepting === project._id ? 'Accepting…' : 'Accept Project'}
        </button>
      </div>
    </motion.div>
  );
}

export default function InitiatorOpenProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [accepting, setAccepting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/initiator/open-projects')
      .then(res => setProjects(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      await api.post(`/initiator/open-projects/${id}/accept`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to accept project');
      setAccepting(null);
    }
  };

  return (
    <>
      <DashboardHeader title="Open Projects" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        <div className="flex items-center gap-2 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <Globe size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Open projects posted by clients. Accept one to add it to your Personal Projects.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
            <button onClick={load} className="mt-3 text-xs px-4 py-2 rounded-lg"
              style={{ background: 'var(--accent)', color: '#fff' }}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No open projects available</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Check back later — clients post new projects regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(p => (
              <OpenProjectCard key={p._id} project={p} onAccept={handleAccept} accepting={accepting} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
