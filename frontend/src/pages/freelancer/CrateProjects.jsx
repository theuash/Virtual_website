import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import {
  FolderKanban, Clock, CheckCircle2, AlertCircle, ChevronRight,
  Calendar, DollarSign, Tag, Users, Loader2, RefreshCw, MessageSquare,
} from 'lucide-react';

const STATUS_CONFIG = {
  open:          { label: 'Open',         color: '#3b82f6', bg: '#3b82f622' },
  in_progress:   { label: 'In Progress',  color: '#f59e0b', bg: '#f59e0b22' },
  under_review:  { label: 'Under Review', color: '#8b5cf6', bg: '#8b5cf622' },
  completed:     { label: 'Completed',    color: '#10b981', bg: '#10b98122' },
  cancelled:     { label: 'Cancelled',    color: '#ef4444', bg: '#ef444422' },
};

const TASK_STATUS_CONFIG = {
  unassigned: { label: 'Unassigned', color: '#6b7280' },
  assigned:   { label: 'Assigned',   color: '#3b82f6' },
  submitted:  { label: 'Submitted',  color: '#8b5cf6' },
  approved:   { label: 'Approved',   color: '#10b981' },
  rejected:   { label: 'Rejected',   color: '#ef4444' },
};

const SKILL_LABELS = {
  video_editing:    'Video Editing',
  '3d_animation':   '3D Animation',
  cgi:              'CGI / VFX',
  script_writing:   'Script Writing',
  graphic_designing:'Graphic Design',
};

function StatusBadge({ status, config }) {
  const cfg = config[status] || { label: status, color: '#6b7280', bg: '#6b728022' };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg || cfg.color + '22' }}
    >
      {cfg.label}
    </span>
  );
}

function ProjectCard({ project, onClick }) {
  const { convert } = useCurrency();
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.open;
  const completedTasks = project.tasks?.filter(t => t.status === 'approved').length ?? 0;
  const totalTasks = project.tasks?.length ?? 0;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const deadline = project.deadline ? new Date(project.deadline) : null;
  const isOverdue = deadline && deadline < new Date() && project.status !== 'completed';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={onClick}
      className="rounded-xl border cursor-pointer overflow-hidden transition-all"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: status.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          </div>
          <StatusBadge status={project.status} config={STATUS_CONFIG} />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={11} />
            {SKILL_LABELS[project.category] || project.category}
          </div>
          {deadline && (
            <div className="flex items-center gap-1 text-xs" style={{ color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
              <Calendar size={11} />
              {isOverdue ? 'Overdue  ' : ''}{deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          )}
          {project.totalAmount && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign size={11} />
              {convert(project.totalAmount).display}
            </div>
          )}
        </div>

        {/* Task progress */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Tasks
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: status.color }}
              />
            </div>
          </div>
        )}

        {/* Tasks list */}
        {project.tasks?.length > 0 && (
          <div className="space-y-1.5">
            {project.tasks.slice(0, 3).map(task => (
              <div
                key={task._id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-card)' }}
              >
                <span className="text-xs truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </span>
                <StatusBadge status={task.status} config={TASK_STATUS_CONFIG} />
              </div>
            ))}
            {project.tasks.length > 3 && (
              <p className="text-[10px] text-center" style={{ color: 'var(--text-secondary)' }}>
                +{project.tasks.length - 3} more tasks
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Users size={12} />
            {project.assignedInitiatorId ? 'Initiator assigned' : 'No initiator yet'}
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetailModal({ project, onClose }) {
  const navigate = useNavigate();
  if (!project) return null;
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.open;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-1.5 w-full" style={{ background: status.color }} />
        <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{project.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={project.status} config={STATUS_CONFIG} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {SKILL_LABELS[project.category] || project.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Description */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Description</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{project.description}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Budget', value: project.totalAmount ? `${convert(project.totalAmount).display}` : '-' },
              { label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : '-' },
              { label: 'Tasks', value: project.tasks?.length ?? 0 },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tasks */}
          {project.tasks?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Your Tasks</p>
              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '-'}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: '#10b981' }}>
                          {convert(task.earnings || 0).display}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} config={TASK_STATUS_CONFIG} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Initiator */}
          {project.assignedInitiatorId && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Project Initiator</p>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black" style={{ background: 'var(--accent)', color: '#fff' }}>
                  {(project.assignedInitiatorId.fullName || 'I').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{project.assignedInitiatorId.fullName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{SKILL_LABELS[project.assignedInitiatorId.primarySkill] || ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function CrateProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/crate/projects');
      setProjects(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  const counts = {
    all:         projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    under_review:projects.filter(p => p.status === 'under_review').length,
    completed:   projects.filter(p => p.status === 'completed').length,
  };

  return (
    <>
      <DashboardHeader title="Projects" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* Filter tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all',          label: 'All' },
              { id: 'in_progress',  label: 'In Progress' },
              { id: 'under_review', label: 'Under Review' },
              { id: 'completed',    label: 'Completed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  background: filter === tab.id ? 'var(--accent)' : 'var(--bg-card)',
                  color:      filter === tab.id ? '#fff' : 'var(--text-secondary)',
                  borderColor:filter === tab.id ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {tab.label}
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: filter === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    color:      filter === tab.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg border transition-all hover:scale-105"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{error}</p>
            <button onClick={load} className="text-xs px-4 py-2 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {filter === 'all' ? 'No projects assigned yet' : `No ${filter.replace('_', ' ')} projects`}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Projects will appear here once a Project Initiator assigns tasks to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onClick={() => setSelected(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
