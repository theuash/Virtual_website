import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/layout/DashboardHeader';
import api from '../../services/api';
import {
  Activity, FolderKanban, Briefcase, AlertTriangle,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';

const STATUS_CFG = {
  open:          { label: 'Open',          color: '#3b82f6' },
  in_progress:   { label: 'In Progress',   color: '#f59e0b' },
  under_review:  { label: 'Under Review',  color: '#8b5cf6' },
  completed:     { label: 'Completed',     color: '#10b981' },
  cancelled:     { label: 'Cancelled',     color: '#ef4444' },
};
const TASK_CFG = {
  unassigned: { label: 'Unassigned', color: '#6b7280' },
  assigned:   { label: 'Assigned',   color: '#3b82f6' },
  submitted:  { label: 'Submitted',  color: '#8b5cf6' },
  approved:   { label: 'Approved',   color: '#10b981' },
  rejected:   { label: 'Rejected',   color: '#ef4444' },
};

function DeadlinePill({ date, extended }) {
  if (!date) return null;
  const days = Math.ceil((new Date(date) - Date.now()) / 86400000);
  const overdue = days < 0;
  const urgent  = days >= 0 && days <= 3;
  const color   = overdue ? '#ef4444' : urgent ? '#f59e0b' : '#10b981';
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: color + '22' }}>
      {extended && <AlertTriangle size={9} />}
      {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
    </span>
  );
}

function WorkFeedItem({ item }) {
  const project = item.project;
  const tasks   = item.tasks || [];
  const s = STATUS_CFG[project?.status] || { color: '#6b7280' };
  const submitted = tasks.filter(t => t.status === 'submitted').length;
  const approved  = tasks.filter(t => t.status === 'approved').length;
  const rejected  = tasks.filter(t => t.status === 'rejected').length;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)', borderLeft: `3px solid ${s.color}` }}>
        <FolderKanban size={14} strokeWidth={1.5} style={{ color: s.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{project?.title || 'Project'}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: s.color, background: s.color + '22' }}>
              {STATUS_CFG[project?.status]?.label || project?.status}
            </span>
            {project?.deadlineExtended && (
              <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: '#f59e0b' }}>
                <AlertTriangle size={9} />Extended
              </span>
            )}
            <DeadlinePill date={project?.deadline} extended={project?.deadlineExtended} />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>No recent updates</p>
        ) : (
          tasks.map(task => {
            const tc = TASK_CFG[task.status] || TASK_CFG.unassigned;
            return (
              <div key={task._id} className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: 'var(--bg-card)' }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tc.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  {task.assignedTo && (
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      by {task.assignedTo.fullName}  {task.assignedTo.tier}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: tc.color }}>{tc.label}</span>
              </div>
            );
          })
        )}
        <div className="flex gap-2 pt-1 flex-wrap">
          {submitted > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#8b5cf6', background: '#8b5cf622' }}>{submitted} Submitted</span>}
          {approved  > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#10b981', background: '#10b98122' }}>{approved} Approved</span>}
          {rejected  > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#ef4444', background: '#ef444422' }}>{rejected} Rejected</span>}
        </div>
      </div>
    </div>
  );
}

function GroupSummaryCard({ summary }) {
  const project = summary.project;
  const pct = summary.totalTasks > 0
    ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)', borderLeft: '3px solid #8b5cf6' }}>
        <Briefcase size={14} strokeWidth={1.5} style={{ color: '#8b5cf6' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{project?.title}</p>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: '#8b5cf622', color: '#8b5cf6' }}>Group Project</span>
        </div>
        <span className="text-sm font-black" style={{ color: '#8b5cf6' }}>{pct}%</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: '#8b5cf6' }} />
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {summary.completedTasks}/{summary.totalTasks} tasks completed
        </p>
        {summary.byInitiator?.map((entry, i) => {
          const done  = entry.tasks?.filter(t => t.status === 'approved').length || 0;
          const total = entry.tasks?.length || 0;
          return (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ background: '#8b5cf6', color: '#fff' }}>
                {(entry.member?.fullName || '?').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {entry.member?.fullName || 'Unassigned'}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{done}/{total} tasks</p>
              </div>
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full"
                  style={{ background: '#8b5cf6', width: total > 0 ? `${Math.round(done / total * 100)}%` : '0%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InitiatorWork() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/initiator/work')
      .then(res => setData(res.data?.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const taskFeed       = data?.taskFeed || [];
  const groupSummaries = data?.groupSummaries || [];

  return (
    <>
      <DashboardHeader title="Work" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-4 rounded-xl border flex-1"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <Activity size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Task updates from your crate team and progress on group projects.
            </p>
          </div>
          <button onClick={load}
            className="ml-3 p-2 rounded-lg border transition-all hover:scale-105 shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
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
        ) : taskFeed.length === 0 && groupSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Activity size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No work updates yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Task submissions and project progress will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Team Task Updates ({taskFeed.length})
              </h3>
              {taskFeed.length === 0
                ? <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No task updates</p>
                : taskFeed.map((item, i) => <WorkFeedItem key={i} item={item} />)
              }
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Group Project Progress ({groupSummaries.length})
              </h3>
              {groupSummaries.length === 0
                ? <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No group projects</p>
                : groupSummaries.map((s, i) => <GroupSummaryCard key={i} summary={s} />)
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
}
