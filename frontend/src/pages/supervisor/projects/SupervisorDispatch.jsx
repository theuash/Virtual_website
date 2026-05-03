import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import { Users, CheckCircle2, Clock, ArrowLeft, Loader2, Zap } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }),
};

function WorkloadBar({ active, total }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Workload</span>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{active}/{total} tasks</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function SupervisorDispatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]   = useState(null);
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/supervisor/projects/${id}`),
      api.get('/supervisor/teams'),
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data?.data ?? pRes.data);
      setTeams(tRes.data?.data ?? tRes.data ?? []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDispatch = async () => {
    if (!selected) return;
    setDispatching(true);
    setError('');
    try {
      await api.post(`/supervisor/projects/${id}/dispatch`, {
        initiatorId: selected.initiatorId ?? selected.initiator?._id,
        memberIds:   selected.memberIds   ?? selected.members?.map(m => m._id) ?? [],
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Dispatch failed. Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Dispatch" />
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Dispatch Project" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/supervisor/projects')}
          className="flex items-center gap-2 text-xs font-semibold mb-6 transition-all hover:gap-3"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Projects
        </button>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* -- Left: Project Details (60%) -- */}
          <div className="lg:w-[60%] space-y-4">
            <motion.div variants={fadeUp} initial="hidden" animate="show"
              className="p-6 rounded-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {project?.timeSensitive && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                        style={{ background: '#ef444422', color: '#ef4444' }}>
                        <Zap size={9} strokeWidth={2.5} /> Time-Sensitive
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{project?.title || '-'}</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {project?.clientName || project?.client?.fullName || '-'}  {project?.clientCompany || project?.client?.company || ''}
                  </p>
                </div>
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold capitalize"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                  {project?.status || 'pending'}
                </span>
              </div>

              {project?.description && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Budget',   value: `?${(project?.budget ?? 0).toLocaleString()}` },
                  { label: 'Deadline', value: project?.deadline ? new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
                  { label: 'Category', value: project?.category || '-' },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                    <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Task list */}
            {project?.tasks?.length > 0 && (
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show"
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tasks ({project.tasks.length})</h3>
                </div>
                <div>
                  {project.tasks.map((task, i) => (
                    <div key={task._id || i} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0"
                      style={{ borderColor: 'var(--border)' }}>
                      <CheckCircle2 size={14} strokeWidth={1.5}
                        style={{ color: task.status === 'approved' ? '#10b981' : 'var(--text-secondary)', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                        {task.description && (
                          <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{task.description}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold capitalize px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                        {task.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* -- Right: Assign Team (40%) -- */}
          <div className="lg:w-[40%] space-y-4">
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Users size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  Assign Team
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Select a team to dispatch this project to</p>
              </div>

              {success ? (
                <div className="p-8 text-center">
                  <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: '#10b981' }} />
                  <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Dispatched!</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Project has been assigned to the team.</p>
                  <button onClick={() => navigate('/supervisor/projects')}
                    className="mt-4 px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    Back to Projects
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {teams.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No teams available.</p>
                  ) : (
                    teams.map((team, i) => {
                      const isSelected = selected?._id === team._id;
                      return (
                        <button key={team._id || i} onClick={() => setSelected(team)}
                          className="w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01]"
                          style={{
                            background: isSelected ? 'rgba(var(--accent-rgb), 0.06)' : 'var(--bg-card)',
                            borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                {team.initiatorName || team.initiator?.fullName || 'Team'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {team.memberCount ?? team.members?.length ?? 0} members
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />}
                          </div>
                          <WorkloadBar
                            active={team.activeTasks ?? 0}
                            total={team.totalTasks ?? (team.activeTasks ?? 0) + 5}
                          />
                        </button>
                      );
                    })
                  )}

                  {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

                  <button onClick={handleDispatch} disabled={!selected || dispatching}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    {dispatching ? <><Loader2 size={15} className="animate-spin" /> Dispatching</> : 'Dispatch Project'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

