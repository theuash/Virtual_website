import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  Users, Loader2, AlertCircle, MessageSquare, Video,
  Star, ChevronRight, Briefcase, CheckCircle2,
} from 'lucide-react';

const SKILL_LABELS = {
  video_editing: 'Video Editing',
  '3d_animation': '3D Animation',
  cgi: 'CGI / VFX',
  script_writing: 'Script Writing',
  graphic_designing: 'Graphic Design',
};

const TIER_COLORS = {
  precrate: { bg: '#6b728022', color: '#6b7280' },
  crate:    { bg: '#3b82f622', color: '#3b82f6' },
  senior:   { bg: '#8b5cf622', color: '#8b5cf6' },
  elite:    { bg: '#f59e0b22', color: '#f59e0b' },
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
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MemberRow({ member }) {
  const tier = TIER_COLORS[member.tier] || TIER_COLORS.crate;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: '#f59e0b', color: '#fff' }}>
        {(member.fullName || 'M').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{member.fullName}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {SKILL_LABELS[member.primarySkill] || member.primarySkill || '—'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
          style={{ background: tier.bg, color: tier.color }}>{member.tier}</span>
        {member.rating > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: '#f59e0b' }}>
            <Star size={9} strokeWidth={2} fill="#f59e0b" />{member.rating?.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SupervisorTeams() {
  const navigate = useNavigate();
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    api.get('/supervisor/teams')
      .then(res => setTeams(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load teams'))
      .finally(() => setLoading(false));
  }, []);

  const handleMessageInitiator = async (team) => {
    if (!team?.initiatorId?._id) return;
    setMessaging(true);
    try {
      const res = await api.post('/messaging/conversations', { participantId: team.initiatorId._id });
      navigate(`/supervisor/messages?conv=${res.data?.data?.conversationId || res.data?.data?._id}`);
    } catch {
      setMessaging(false);
    }
  };

  return (
    <>
      <DashboardHeader title="Teams" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Team list */}
            <div className="lg:w-[40%] space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-secondary)' }}>
                All Teams ({teams.length})
              </h2>
              {teams.length === 0 ? (
                <div className="py-16 text-center">
                  <Users size={32} strokeWidth={1} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No teams yet.</p>
                </div>
              ) : (
                teams.map((team, i) => (
                  <motion.button
                    key={team._id || i}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelected(team)}
                    className="w-full p-4 rounded-xl border text-left transition-all"
                    style={{
                      background: selected?._id === team._id ? 'rgba(245,158,11,0.06)' : 'var(--bg-secondary)',
                      borderColor: selected?._id === team._id ? '#f59e0b' : 'var(--border)',
                    }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {team.initiatorId?.fullName || 'Team'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {team.members?.length ?? 0} members · {team.projectId?.title || 'No project'}
                        </p>
                      </div>
                      <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <WorkloadBar active={team.activeTasks ?? 0} total={team.totalTasks ?? 0} />
                  </motion.button>
                ))
              )}
            </div>

            {/* Right: Team detail */}
            <div className="lg:flex-1">
              {!selected ? (
                <div className="flex flex-col items-center justify-center h-64 rounded-xl border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <Users size={32} strokeWidth={1} className="mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select a team to view details</p>
                </div>
              ) : (
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border overflow-hidden"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  {/* Header */}
                  <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                          {selected.initiatorId?.fullName || 'Team'}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {selected.projectId?.title || 'No project assigned'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/supervisor/meet')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{ background: '#3b82f622', color: '#3b82f6' }}>
                          <Video size={13} strokeWidth={1.5} /> Meet
                        </button>
                        <button
                          onClick={() => handleMessageInitiator(selected)}
                          disabled={messaging}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                          style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                          <MessageSquare size={13} strokeWidth={1.5} />
                          {messaging ? 'Opening…' : 'Message'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Project info */}
                    {selected.projectId && (
                      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Current Project</p>
                        <div className="flex items-center gap-3">
                          <Briefcase size={14} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.projectId.title}</p>
                            <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{selected.projectId.status}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Task breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total', value: selected.totalTasks ?? 0, color: 'var(--text-primary)' },
                        { label: 'Active', value: selected.activeTasks ?? 0, color: '#f59e0b' },
                        { label: 'Done', value: (selected.totalTasks ?? 0) - (selected.activeTasks ?? 0), color: '#10b981' },
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
                          <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Members */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Members ({selected.members?.length ?? 0})
                      </p>
                      <div className="space-y-2">
                        {/* Initiator */}
                        {selected.initiatorId && (
                          <div className="flex items-center gap-3 p-3 rounded-xl border"
                            style={{ background: 'var(--bg-card)', borderColor: '#f59e0b44' }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                              style={{ background: '#f59e0b', color: '#fff' }}>
                              {(selected.initiatorId.fullName || 'I').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{selected.initiatorId.fullName}</p>
                              <p className="text-[10px]" style={{ color: '#f59e0b' }}>Initiator</p>
                            </div>
                            {selected.initiatorId.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                                <Star size={9} strokeWidth={2} fill="#f59e0b" />{selected.initiatorId.rating?.toFixed(1)}
                              </span>
                            )}
                          </div>
                        )}
                        {(selected.members || []).map((m, i) => (
                          <MemberRow key={m._id || i} member={m} />
                        ))}
                        {(!selected.members || selected.members.length === 0) && (
                          <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No members assigned.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
