import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import {
  FolderKanban, Users, Briefcase, Calendar, Clock,
  AlertTriangle, ChevronRight, Loader2, RefreshCw,
  Tag, DollarSign, Star, Play,
} from 'lucide-react';
import { useCurrency } from '../../../context/CurrencyContext';

//  Constants 
const SKILL_LABELS = {
  video_editing: 'Video Editing', '3d_animation': '3D Animation',
  cgi: 'CGI / VFX', script_writing: 'Script Writing', graphic_designing: 'Graphic Design',
};
const STATUS_CFG = {
  open:          { label: 'Open',          color: '#3b82f6', bg: '#3b82f622' },
  in_progress:   { label: 'In Progress',   color: '#f59e0b', bg: '#f59e0b22' },
  under_review:  { label: 'Under Review',  color: '#8b5cf6', bg: '#8b5cf622' },
  completed:     { label: 'Completed',     color: '#10b981', bg: '#10b98122' },
  cancelled:     { label: 'Cancelled',     color: '#ef4444', bg: '#ef444422' },
};
const TASK_CFG = {
  unassigned: { label: 'Unassigned', color: '#6b7280' },
  assigned:   { label: 'Assigned',   color: '#3b82f6' },
  submitted:  { label: 'Submitted',  color: '#8b5cf6' },
  approved:   { label: 'Approved',   color: '#10b981' },
  rejected:   { label: 'Rejected',   color: '#ef4444' },
};
const TABS = [
  { id: 'team',     label: 'Team Projects',    icon: <Users size={14} strokeWidth={1.5} /> },
  { id: 'group',    label: 'Group Projects',   icon: <Briefcase size={14} strokeWidth={1.5} /> },
  { id: 'personal', label: 'Personal',         icon: <FolderKanban size={14} strokeWidth={1.5} /> },
];

//  Shared helpers 
function StatusBadge({ status, cfg = STATUS_CFG }) {
  const c = cfg[status] || { label: status, color: '#6b7280', bg: '#6b728022' };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: c.color, background: c.bg || c.color + '22' }}>
      {c.label}
    </span>
  );
}
function Avatar({ name = '?', color = 'var(--accent)', size = 8 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-black shrink-0`}
      style={{ background: color, color: '#fff' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 opacity-20">{icon}</div>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  );
}
function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - Date.now()) / 86400000);
}
function DeadlinePill({ date, extended }) {
  const days = daysUntil(date);
  if (days === null) return null;
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
function TaskProgressBar({ tasks = [], color = 'var(--accent)' }) {
  const total    = tasks.length;
  const approved = tasks.filter(t => t.status === 'approved').length;
  const submitted= tasks.filter(t => t.status === 'submitted').length;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {approved}/{total} done {submitted > 0 && ` ${submitted} pending review`}
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

//  Project Detail Modal 
function ProjectDetailModal({ project, onClose }) {
  const { convert } = useCurrency();
  if (!project) return null;
  const s = STATUS_CFG[project.status] || STATUS_CFG.open;
  const tasks = project.tasks || [];
  const team  = project.team;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5 w-full" style={{ background: s.color }} />
        <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{project.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={project.status} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {SKILL_LABELS[project.category] || project.category}
              </span>
              {project.deadlineExtended && (
                <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={10} />Deadline Extended
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-lg leading-none"
            style={{ color: 'var(--text-secondary)' }}>x</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{project.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Budget',   value: project.totalAmount ? `${convert(project.totalAmount).display}` : project.openBudget ? `${convert(project.openBudget).display}` : '-' },
              { label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : '-' },
              { label: 'Start',    value: project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN') : '-' },
              { label: 'Duration', value: project.durationDays ? `${project.durationDays}d` : '-' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>
          {project.originalDeadline && project.deadlineExtended && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#f59e0b22' }}>
              <AlertTriangle size={14} style={{ color: '#f59e0b', marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>Deadline Extended</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Original: {new Date(project.originalDeadline).toLocaleDateString('en-IN')}
                  {project.deadlineExtensionReason && ` - ${project.deadlineExtensionReason}`}
                </p>
              </div>
            </div>
          )}
          {tasks.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Tasks ({tasks.length})</p>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task._id} className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      {task.assignedTo && (
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {task.assignedTo.fullName} - Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '-'}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={task.status} cfg={TASK_CFG} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {team?.members?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Team Members</p>
              <div className="space-y-2">
                {team.members.map(m => (
                  <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <Avatar name={m.fullName} size={7} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.fullName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {SKILL_LABELS[m.primarySkill] || m.primarySkill} - {m.tasksCompleted || 0} tasks done
                      </p>
                    </div>
                    {m.rating > 0 && (
                      <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                        <Star size={10} fill="#f59e0b" />{m.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

//  Team Projects Tab 
function TeamProjectCard({ project, onClick }) {
  const s = STATUS_CFG[project.status] || STATUS_CFG.open;
  const { convert } = useCurrency();
  const tasks   = project.tasks || [];
  const members = project.team?.members || [];
  const startDays = daysUntil(project.startDate);
  const notStarted = startDays !== null && startDays > 0;
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="rounded-xl border cursor-pointer overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: s.color }} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={10} />{SKILL_LABELS[project.category] || project.category}
          </span>
          {project.totalAmount && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign size={10} />{convert(project.totalAmount).display}
            </span>
          )}
          {notStarted ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: '#3b82f6', background: '#3b82f622' }}>
              <Play size={9} />Starts in {startDays}d
            </span>
          ) : (
            <DeadlinePill date={project.deadline} extended={project.deadlineExtended} />
          )}
          {project.deadlineExtended && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: '#f59e0b', background: '#f59e0b22' }}>
              <AlertTriangle size={9} />Extended
            </span>
          )}
        </div>
        <TaskProgressBar tasks={tasks} color={s.color} />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {members.slice(0, 4).map((m, i) => (
              <div key={m._id || i}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2"
                style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--bg-secondary)', marginLeft: i > 0 ? '-6px' : 0 }}>
                {(m.fullName || '?').charAt(0)}
              </div>
            ))}
            {members.length > 4 && <span className="text-[10px] ml-1" style={{ color: 'var(--text-secondary)' }}>+{members.length - 4}</span>}
            {members.length === 0 && <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>No team yet</span>}
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
    </motion.div>
  );
}

function TeamProjectsTab({ data, loading }) {
  const [selected, setSelected] = useState(null);
  if (loading) return <LoadingSpinner />;
  if (!data?.length) return (
    <EmptyState icon={<Users size={40} />} title="No active team projects"
      sub="Projects assigned to your crate team will appear here." />
  );
  const active   = data.filter(p => p.status === 'in_progress');
  const upcoming = data.filter(p => p.status === 'open' && daysUntil(p.startDate) > 0);
  const review   = data.filter(p => p.status === 'under_review');
  const Section = ({ title, items, color }) => items.length === 0 ? null : (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {title} ({items.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(p => <TeamProjectCard key={p._id} project={p} onClick={() => setSelected(p)} />)}
      </div>
    </div>
  );
  return (
    <div className="space-y-8">
      <Section title="In Progress" items={active}   color="#f59e0b" />
      <Section title="Upcoming"    items={upcoming} color="#3b82f6" />
      <Section title="Under Review" items={review}  color="#8b5cf6" />
      <AnimatePresence>
        {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

//  Group Projects Tab 
function GroupProjectCard({ project, onClick }) {
  const s = STATUS_CFG[project.status] || STATUS_CFG.open;
  const coInitiators = project.coInitiators || [];
  const tasks = project.tasks || [];
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="rounded-xl border cursor-pointer overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#8b5cf6' }} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: '#8b5cf622', color: '#8b5cf6' }}>Group</span>
            </div>
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={10} />{SKILL_LABELS[project.category] || project.category}
          </span>
          <DeadlinePill date={project.deadline} extended={project.deadlineExtended} />
        </div>
        <TaskProgressBar tasks={tasks} color="#8b5cf6" />
        <div>
          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Co-Initiators ({coInitiators.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {coInitiators.map((ci, i) => (
              <div key={ci._id || i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: 'var(--bg-card)' }}>
                <Avatar name={ci.fullName} color="#8b5cf6" size={5} />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>{ci.fullName}</span>
              </div>
            ))}
            {coInitiators.length === 0 && (
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>No co-initiators yet</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GroupProjectsTab({ data, loading }) {
  const [selected, setSelected] = useState(null);
  if (loading) return <LoadingSpinner />;
  if (!data?.length) return (
    <EmptyState icon={<Briefcase size={40} />} title="No group projects"
      sub="Group projects assigned by your Momentum Supervisor will appear here." />
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(p => <GroupProjectCard key={p._id} project={p} onClick={() => setSelected(p)} />)}
      </div>
      <AnimatePresence>
        {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

//  Personal Projects Tab 
function PersonalProjectCard({ project, onClick }) {
  const s = STATUS_CFG[project.status] || STATUS_CFG.open;
  const tasks = project.tasks || [];
  const { convert } = useCurrency();
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="rounded-xl border cursor-pointer overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#10b981' }} />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={10} />{SKILL_LABELS[project.category] || project.category}
          </span>
          {project.totalAmount && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign size={10} />{convert(project.totalAmount).display}
            </span>
          )}
          <DeadlinePill date={project.deadline} extended={project.deadlineExtended} />
        </div>
        <TaskProgressBar tasks={tasks} color="#10b981" />
        {project.clientId && (
          <div className="flex items-center gap-2 pt-1">
            <Avatar name={project.clientId.fullName || project.clientId.company || 'C'} color="#10b981" size={6} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {project.clientId.fullName || project.clientId.company || 'Client'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PersonalProjectsTab({ data, loading }) {
  const [selected, setSelected] = useState(null);
  if (loading) return <LoadingSpinner />;
  if (!data?.length) return (
    <EmptyState icon={<FolderKanban size={40} />} title="No personal projects"
      sub="Projects you accept or are assigned directly will appear here." />
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map(p => <PersonalProjectCard key={p._id} project={p} onClick={() => setSelected(p)} />)}
      </div>
      <AnimatePresence>
        {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

//  Main Component 
export default function InitiatorProjects() {
  const [activeTab, setActiveTab] = useState('team');
  const [data, setData]           = useState({});
  const [loading, setLoading]     = useState({});

  const fetchTab = useCallback(async (tab) => {
    if (data[tab] !== undefined) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let res;
      if (tab === 'team')     res = await api.get('/initiator/projects/team');
      if (tab === 'group')    res = await api.get('/initiator/projects/group');
      if (tab === 'personal') res = await api.get('/initiator/projects/personal');
      setData(prev => ({ ...prev, [tab]: res?.data?.data }));
    } catch {
      setData(prev => ({ ...prev, [tab]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [data]);

  useEffect(() => { fetchTab(activeTab); }, [activeTab]);

  const refreshTab = () => {
    setData(prev => ({ ...prev, [activeTab]: undefined }));
    setTimeout(() => fetchTab(activeTab), 50);
  };

  return (
    <>
      <DashboardHeader title="Projects" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  background:  activeTab === tab.id ? 'var(--accent)' : 'var(--bg-card)',
                  color:       activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  borderColor: activeTab === tab.id ? 'var(--accent)' : 'var(--border)',
                }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
          <button onClick={refreshTab}
            className="p-2 rounded-lg border transition-all hover:scale-105"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {activeTab === 'team'     && <TeamProjectsTab     data={data.team}     loading={!!loading.team} />}
            {activeTab === 'group'    && <GroupProjectsTab    data={data.group}    loading={!!loading.group} />}
            {activeTab === 'personal' && <PersonalProjectsTab data={data.personal} loading={!!loading.personal} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
