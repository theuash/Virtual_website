import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  Users, Briefcase, FolderKanban, Globe, CheckCircle2,
  Clock, ChevronRight, Loader2, Activity,
} from 'lucide-react';

const TASK_CFG = {
  submitted: { label: 'Submitted', color: '#8b5cf6' },
  approved:  { label: 'Approved',  color: '#10b981' },
  assigned:  { label: 'Assigned',  color: '#3b82f6' },
  rejected:  { label: 'Rejected',  color: '#ef4444' },
};

function StatCard({ label, value, icon, color, onClick }) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} onClick={onClick}
      className="p-5 rounded-xl border cursor-pointer transition-all"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: color + '22', color }}>
          {icon}
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest mt-1"
        style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </motion.div>
  );
}

export default function InitiatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/initiator/dashboard')
      .then(res => setStats(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || 'Initiator';

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Good to see you, {firstName}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here is a snapshot of your active projects and team activity.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Team Projects"    value={stats?.stats?.teamCount    ?? 0} icon={<Users size={18} strokeWidth={1.5} />}       color="#f59e0b" onClick={() => navigate('/initiator/projects')} />
              <StatCard label="Group Projects"   value={stats?.stats?.groupCount   ?? 0} icon={<Briefcase size={18} strokeWidth={1.5} />}   color="#8b5cf6" onClick={() => navigate('/initiator/projects')} />
              <StatCard label="Personal"         value={stats?.stats?.personalCount ?? 0} icon={<FolderKanban size={18} strokeWidth={1.5} />} color="#10b981" onClick={() => navigate('/initiator/projects')} />
              <StatCard label="Open Available"   value={stats?.stats?.openCount    ?? 0} icon={<Globe size={18} strokeWidth={1.5} />}       color="#3b82f6" onClick={() => navigate('/initiator/projects')} />
            </div>

            {/* Recent task activity */}
            <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <Activity size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Task Activity</h3>
              </div>
              {!stats?.recentTasks?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Activity size={28} strokeWidth={1} className="mb-2 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No recent task updates</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {stats.recentTasks.map((task, i) => {
                    const tc = TASK_CFG[task.status] || { label: task.status, color: '#6b7280' };
                    return (
                      <div key={task._id || i} className="flex items-center gap-4 px-5 py-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tc.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                            {task.projectId?.title} {task.assignedTo && ` by ${task.assignedTo.fullName}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold shrink-0" style={{ color: tc.color }}>{tc.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
