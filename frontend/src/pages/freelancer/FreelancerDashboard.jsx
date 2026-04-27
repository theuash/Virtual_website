import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, TIER_LABELS } from '../../utils/roleGuards';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
import LockedBlock from '../../components/LockedBlock';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckCircle2, CircleDollarSign, ArrowRight,
  TrendingUp, Clock, BookOpen, Play, Lock, ChevronRight, Zap, PlayCircle, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import GuidedTour from '../../components/GuidedTour';

const TIER_ORDER = ['precrate', 'crate', 'project_initiator', 'momentum_supervisor', 'admin'];
const TIER_DESCRIPTIONS = {
  precrate:            'Entry level - complete your learning modules and get your first project to advance.',
  crate:               'Proven contributor - eligible for complex tasks.',
  project_initiator:   'Leads project fragmentation and task assignment.',
  momentum_supervisor: 'Oversees quality and delivery across departments.',
  admin:               'Full platform access.',
};

function StatCard({ label, value, icon, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, translateY: -4 }}
      className="p-5 rounded-xl border transition-all"
      style={{
        background: highlight ? 'var(--accent)' : 'var(--bg-secondary)',
        borderColor: highlight ? 'var(--accent)' : 'var(--border)',
        boxShadow: highlight ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
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
    </motion.div>
  );
}

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isPrecrate = !user?.tier || user.tier === 'precrate';

  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['freelancerDashboard', user?._id],
    queryFn: async () => {
      const res = await api.get('/freelancer/dashboard');
      return res.data?.data ?? res.data;
    },
  });

  const { data: mentor } = useQuery({
    queryKey: ['freelancerMentor', user?._id],
    queryFn: async () => {
      const res = await api.get('/freelancer/supervisor');
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch real learning progress
  const [progressMap, setProgressMap] = useState({});
  const [catalogue, setCatalogue] = useState(null);
  const [learningLoading, setLearningLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/freelancer/learning/progress'),
      api.get('/learning/catalogue'),
    ]).then(([progRes, catRes]) => {
      setProgressMap(progRes.data?.data ?? {});
      setCatalogue(catRes.data?.data ?? {});
    }).catch(() => {}).finally(() => setLearningLoading(false));
  }, []);

  // Build flat list of all videos from user's skills
  const allVideos = (() => {
    if (!catalogue || !user?.primarySkill) return [];
    const skills = [user.primarySkill, ...(user.secondarySkills || [])];
    const videos = [];
    for (const skill of skills) {
      const skillData = catalogue[skill];
      if (!skillData) continue;
      for (const software of Object.keys(skillData)) {
        const sw = skillData[software];
        for (const t of (sw.tutorials || [])) {
          videos.push({ ...t, skill, software, source: 'tutorial' });
        }
        for (const p of (sw.playlists || [])) {
          for (const v of (p.videos || [])) {
            videos.push({ ...v, skill, software, source: 'playlist', playlistTitle: p.title });
          }
        }
        for (const c of (sw.crash_courses || [])) {
          for (const v of (c.videos || [])) {
            videos.push({ ...v, skill, software, source: 'crash_course', courseTitle: c.title });
          }
        }
      }
    }
    // Deduplicate by youtubeId
    const seen = new Set();
    return videos.filter(v => { if (seen.has(v.youtubeId)) return false; seen.add(v.youtubeId); return true; });
  })();

  // Continue watching: videos with progress > 5% but not completed
  const continueWatching = allVideos.filter(v => {
    const p = progressMap[v.youtubeId];
    if (!p || p.completed) return false;
    const pct = p.durationSeconds > 0 ? p.watchedSeconds / p.durationSeconds : 0;
    return pct > 0.05;
  }).slice(0, 3);

  // Completed count
  const completedCount = allVideos.filter(v => progressMap[v.youtubeId]?.completed).length;
  const totalCount = allVideos.length;

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

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('dashboardSidebarOpen');
    if (saved !== null) setSidebarOpen(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  if (isLoading) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-8 grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-28 rounded-xl animate-pulse"
            style={{ background: 'var(--bg-secondary)' }}
          />
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <>
      <GuidedTour />
      <DashboardHeader title="Dashboard" />
      <motion.div
        className="p-6 md:p-8 max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/*  Greeting + Tier  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Greeting */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 p-5 rounded-xl border transition-all"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
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
            <div id="tour-welcome-card" className="mt-4 flex items-center gap-3 flex-wrap">
              {/* View Projects - locked for precrate */}
              {isPrecrate ? (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-not-allowed select-none"
                  style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Lock size={13} strokeWidth={2} />
                  View Projects
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/freelancer/tasks')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <FolderKanban size={14} /> View Projects
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/freelancer/progress')}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
              >
                <TrendingUp size={14} /> Career Matrix
              </motion.button>
            </div>
          </motion.div>

          {/* Tier card */}
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-xl border transition-all"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taskPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/*  Mentor card  */}
        {mentor && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {mentor.avatar
                ? <img src={mentor.avatar} alt={mentor.fullName} className="w-10 h-10 rounded-full object-cover" />
                : (mentor.fullName?.[0] || 'S').toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                Your Momentum Supervisor
              </div>
              <div className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>
                {mentor.fullName}
              </div>
              {mentor.supervisorCode && (
                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                  {mentor.supervisorCode}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Team size
              </div>
              <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {mentor.supervisedFreelancers?.length ?? 0}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          id="tour-stats-row"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Projects Done - locked */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate">
              <StatCard label="Projects Done" value="-" icon={<CheckCircle2 size={17} strokeWidth={1.5} />} />
            </LockedBlock>
          ) : (
            <StatCard label="Projects Done" value={completedTasks} icon={<CheckCircle2 size={17} strokeWidth={1.5} />} />
          )}

          {/* Total Earnings - locked */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate">
              <StatCard label="Total Earnings" value="-" icon={<CircleDollarSign size={17} strokeWidth={1.5} />} highlight />
            </LockedBlock>
          ) : (
            <StatCard label="Total Earnings" value={formatCurrency(totalEarnings)} icon={<CircleDollarSign size={17} strokeWidth={1.5} />} highlight />
          )}

          <StatCard
            label="Learning Progress"
            value={learningLoading ? '' : `${completedCount}/${totalCount}`}
            icon={<BookOpen size={17} strokeWidth={1.5} />}
          />
        </motion.div>

        {/*  Main grid  */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Active Projects - locked for precrate */}
          {isPrecrate ? (
            <LockedBlock label="Unlocks at Crate" className="lg:col-span-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <motion.div
                variants={itemVariants}
                className="rounded-xl border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
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
              </motion.div>
            </LockedBlock>
          ) : (
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 rounded-xl border transition-all"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
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
                  <motion.div
                    key={task._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="group flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    onClick={() => navigate('/freelancer/tasks')}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><Clock size={10} /> {task.estimation || '23 hrs'}</span>
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
                  </motion.div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/freelancer/tasks')}
                  className="w-full py-2.5 text-sm font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 hover:gap-3"
                  style={{ color: 'var(--accent)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  All Projects <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Rank Progression - locked for precrate */}
            {isPrecrate ? (
              <LockedBlock label="Unlocks at Crate" className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-xl border p-5"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
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
                </motion.div>
              </LockedBlock>
            ) : (
              <motion.div
                id="tour-rank-card"
                variants={itemVariants}
                className="rounded-xl border p-5 transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${taskPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Earnings</span>
                      <span className="text-[9px] font-black" style={{ color: 'var(--accent)' }}>{formatCurrency(totalEarnings)}/{formatCurrency(nextEarnTarget)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${earnPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Learning */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl border transition-all"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <BookOpen size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Learning
                </h2>
                <span className="text-[9px] font-black" style={{ color: 'var(--text-secondary)' }}>
                  {learningLoading ? '' : `${completedCount}/${totalCount} done`}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest px-1 mb-2" style={{ color: 'var(--accent)' }}>
                      Continue Watching
                    </p>
                    {continueWatching.map((v, idx) => {
                      const p = progressMap[v.youtubeId];
                      const pct = p?.durationSeconds > 0 ? Math.round((p.watchedSeconds / p.durationSeconds) * 100) : 0;
                      return (
                        <motion.div
                          key={v.youtubeId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                          onClick={() => navigate(`/freelancer/learning?resume=${v.youtubeId}`)}
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all mb-1.5"
                          style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)44' }}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-black">
                            <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                              alt={v.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayCircle size={18} className="text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
                            <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                            </div>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{pct}% watched</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Recent videos from catalogue */}
                {learningLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />)}
                  </div>
                ) : allVideos.length === 0 ? (
                  <div className="py-6 text-center">
                    <BookOpen size={24} strokeWidth={1} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No videos yet. Complete onboarding to unlock learning.</p>
                  </div>
                ) : (
                  allVideos.slice(0, 4).map((v, idx) => {
                    const done = progressMap[v.youtubeId]?.completed;
                    const p = progressMap[v.youtubeId];
                    const pct = p?.durationSeconds > 0 ? Math.round((p.watchedSeconds / p.durationSeconds) * 100) : 0;
                    return (
                      <motion.div
                        key={v.youtubeId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate('/freelancer/learning')}
                        className="flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                        style={{
                          background: 'var(--bg-card)',
                          borderColor: done ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: done ? 'var(--accent)' : 'var(--border)', color: done ? '#fff' : 'var(--text-secondary)' }}>
                          {done ? <CheckCircle2 size={13} strokeWidth={2} /> : <Play size={11} strokeWidth={2} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {v.level}  {v.software?.replace(/_/g, ' ')}
                          </p>
                          {pct > 0 && !done && (
                            <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.6 }} />
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-black shrink-0" style={{ color: done ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          {done ? 'Done' : pct > 0 ? `${pct}%` : v.duration || ''}
                        </span>
                      </motion.div>
                    );
                  })
                )}
              </div>
              <div className="px-3 pb-3">
                <button onClick={() => navigate('/freelancer/learning')}
                  className="w-full py-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 hover:gap-3"
                  style={{ color: 'var(--accent)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  All Learning <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </>
  );
}
