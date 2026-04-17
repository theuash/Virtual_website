import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, TIER_LABELS } from '../../utils/roleGuards';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
import LockedBlock from '../../components/LockedBlock';
import {
  FolderKanban, CheckCircle2, CircleDollarSign, ArrowRight,
  TrendingUp, Clock, BookOpen, Play, Lock, ChevronRight, Zap
} from 'lucide-react';

const TIER_ORDER = ['precrate', 'crate', 'project_initiator', 'momentum_supervisor', 'admin'];
const TIER_DESCRIPTIONS = {
  precrate:            'Entry level — complete your learning modules and get your first project to advance.',
  crate:               'Proven contributor — eligible for complex tasks.',
  project_initiator:   'Leads project fragmentation and task assignment.',
  momentum_supervisor: 'Oversees quality and delivery across departments.',
  admin:               'Full platform access.',
};

const LEARNING_MODULES = [
  { id: 1, title: 'Platform Orientation',    desc: 'How Virtual works — departments, micro-tasks, and the chain of command.', duration: '8 min',  locked: false, completed: true },
  { id: 2, title: 'Delivering Quality Work', desc: 'Standards expected at every tier. What Momentum Supervisors check.',       duration: '12 min', locked: false, completed: false },
  { id: 3, title: 'Escrow & Payment Flow',   desc: 'How client funds move from wallet to escrow to your earnings.',            duration: '6 min',  locked: false, completed: false },
  { id: 4, title: 'Advancing Through Tiers', desc: 'The three metrics that drive promotion: accuracy, speed, and volume.',     duration: '10 min', locked: true,  completed: false },
];

function StatCard({ label, value, icon, highlight }) {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        background: highlight ? 'var(--accent)' : 'var(--bg-secondary)',
        borderColor: highlight ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: highlight ? 'rgba(255,255,255,0.15)' : 'var(--bg-card)',
            color: highlight ? '#fff' : 'var(--accent)',
          }}
        >
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-black tracking-tight"
        style={{ color: highlight ? '#fff' : 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPrecrate = !user?.tier || user.tier === 'precrate';

  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['freelancerDashboard', user?._id],
    queryFn: async () => {
      const res = await api.get('/freelancer/dashboard');
      return res.data?.data ?? res.data;
    },
  });

  const completedTasks = metrics?.stats?.completedTasks  ?? 0;
  const totalEarnings  = metrics?.stats?.totalEarnings   ?? 0;
  const projects       = metrics?.tasks ?? [];
  const nextTaskTarget = metrics?.rankMeta?.nextTaskThreshold     ?? 20;
  const nextEarnTarget = metrics?.rankMeta?.nextEarningsThreshold ?? 5000;
  const taskPct = Math.min(100, Math.round((completedTasks / nextTaskTarget) * 100));
  const earnPct = Math.min(100, Math.round((totalEarnings  / nextEarnTarget) * 100));
  const tierLabel = user?.tier ? TIER_LABELS[user.tier] : 'Precrate';
  const tierDesc  = TIER_DESCRIPTIONS[user?.tier] || TIER_DESCRIPTIONS.precrate;
  const currentTierIdx = TIER_ORDER.indexOf(user?.tier || 'precrate');
  const nextTier = TIER_ORDER[currentTierIdx + 1];
  const nextTierLabel = nextTier ? TIER_LABELS[nextTier] : null;
  const completedModules = LEARNING_MODULES.filter(m => m.completed).length;

  if (isLoading) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-8 grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}
      </div>
    </>
  );

  if (isError) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Could not load dashboard data.
      </div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── Greeting + Tier ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Greeting */}
          <div
            className="md:col-span-2 p-5 rounded-xl border flex flex-col justify-between"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome back
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName?.split(' ')[0] || 'Freelancer'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {tierDesc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {/* View Projects — locked for precrate */}
              {isPrecrate ? (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-not-allowed select-none"
                  style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Lock size={13} strokeWidth={2} />
                  View Projects
                </div>
              ) : (
                <button
                  onClick={() => navigate('/freelancer/tasks')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <FolderKanban size={14} /> View Projects
                </button>
              )}
              <button
                onClick={() => navigate('/freelancer/progress')}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all hover:scale-105"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
              >
                <TrendingUp size={14} /> Career Matrix
              </button>
            </div>
          </div>

          {/* Tier card */}
          <div
            className="p-5 rounded-xl border flex flex-col justify-between"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                Current Tier
              </div>
              <div className="text-xl font-black mb-1" style={{ color: 'var(--accent)' }}>
                {tierLabel}
              </div>
              {nextTierLabel && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Next: <span style={{ color: 'var(--text-primary)' }}>{nextTierLabel}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span className="text-[9px] font-black" style={{ color: 'var(--accent)' }}>{taskPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${taskPct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Projects Done — locked */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate">
              <StatCard label="Projects Done" value="—" icon={<CheckCircle2 size={17} strokeWidth={1.5} />} />
            </LockedBlock>
          ) : (
            <StatCard label="Projects Done" value={completedTasks} icon={<CheckCircle2 size={17} strokeWidth={1.5} />} />
          )}

          {/* Total Earnings — locked */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate">
              <StatCard label="Total Earnings" value="—" icon={<CircleDollarSign size={17} strokeWidth={1.5} />} highlight />
            </LockedBlock>
          ) : (
            <StatCard label="Total Earnings" value={formatCurrency(totalEarnings)} icon={<CircleDollarSign size={17} strokeWidth={1.5} />} highlight />
          )}

          <StatCard
            label="Learning Progress"
            value={`${completedModules}/${LEARNING_MODULES.length}`}
            icon={<BookOpen size={17} strokeWidth={1.5} />}
          />
        </div>

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Active Projects — locked for precrate */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate" className="lg:col-span-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FolderKanban size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                    Active Projects
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-card)' }} />
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="h-10 rounded-lg" style={{ background: 'var(--bg-card)' }} />
                </div>
              </div>
            </LockedBlock>
          ) : (
            <div className="lg:col-span-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FolderKanban size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  Active Projects
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{ color: 'var(--accent)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  {user?.primarySkill?.replace(/_/g, ' ') || 'All Skills'}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {projects.length === 0 ? (
                  <div className="py-12 text-center">
                    <FolderKanban size={28} strokeWidth={1} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active projects right now.</p>
                  </div>
                ) : projects.slice(0, 4).map((task, i) => (
                  <div key={task._id || i}
                    className="group flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    onClick={() => navigate('/freelancer/tasks')}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><Clock size={10} /> {task.estimation || '2–3 hrs'}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                          {task.status || 'assigned'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
                        +{task.points ?? 0} xp
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => navigate('/freelancer/tasks')}
                  className="w-full py-2.5 text-sm font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 hover:gap-3"
                  style={{ color: 'var(--accent)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  All Projects <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Rank Progression — locked for precrate */}
            {isPrecrate ? (
              <LockedBlock label="Unlocks at Crate" className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Zap size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Rank Progression
                  </h2>
                  <div className="space-y-4">
                    {['Projects', 'Earnings'].map(label => (
                      <div key={label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </LockedBlock>
            ) : (
              <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                  <Zap size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Rank Progression
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Projects</span>
                      <span className="text-[9px] font-black" style={{ color: 'var(--accent)' }}>{completedTasks}/{nextTaskTarget}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${taskPct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Earnings</span>
                      <span className="text-[9px] font-black" style={{ color: 'var(--accent)' }}>{formatCurrency(totalEarnings)}/{formatCurrency(nextEarnTarget)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${earnPct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning */}
            <div className="rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <BookOpen size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Learning
                </h2>
                <span className="text-[9px] font-black" style={{ color: 'var(--text-secondary)' }}>
                  {completedModules}/{LEARNING_MODULES.length} done
                </span>
              </div>
              <div className="p-3 space-y-2">
                {LEARNING_MODULES.map(module => (
                  <div key={module.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: module.completed ? 'var(--accent)' : 'var(--border)',
                      opacity: module.locked ? 0.5 : 1,
                      cursor: module.locked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: module.completed ? 'var(--accent)' : 'var(--border)', color: module.completed ? '#fff' : 'var(--text-secondary)' }}>
                      {module.locked ? <Lock size={11} strokeWidth={2} /> : module.completed ? <CheckCircle2 size={13} strokeWidth={2} /> : <Play size={11} strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{module.title}</div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={9} /> {module.duration}
                        {module.completed && <span style={{ color: 'var(--accent)' }}>✓ Complete</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
