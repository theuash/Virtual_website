import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/roleGuards';
import api from '../../services/api';
import { FolderKanban, Clock, Wallet, Check, AlertCircle, Info, ArrowRight } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();

  // Fetch true data from backend
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['clientDashboard', user?.id],
    queryFn: async () => {
      const res = await api.get('/client/dashboard');
      return res.data;
    }
  });

  const activeProjects = dashboardData?.stats?.activeProjects || 0;
  const pendingApprovals = dashboardData?.stats?.pendingApprovals || 0;
  const totalSpent = dashboardData?.stats?.totalSpent || 0;
  const projects = dashboardData?.projects || [];
  const activities = dashboardData?.activities || [];
  
  const stats = [
    { label: 'Active Projects', value: activeProjects, icon: <FolderKanban size={24} strokeWidth={1.5} /> },
    { label: 'Pending Approvals', value: pendingApprovals, icon: <Clock size={24} strokeWidth={1.5} /> },
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: <Wallet size={24} strokeWidth={1.5} /> },
  ];

  if (isLoading) return <div className="text-text-muted mt-10">Loading dashboard...</div>;
  if (isError) return <div className="text-red-400 mt-10">Error loading dashboard data. Please ensure backend is running.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight text-white">Dashboard</h1>
        <p className="text-text-muted mt-2 font-light">Welcome back, {user?.name || 'Client'}. Here's your project overview.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-4 mb-4 text-violet-300">
              <div className="w-10 h-10 rounded-full bg-violet-900/20 text-violet-light border border-violet-bloom/20 flex items-center justify-center">
                 {stat.icon}
              </div>
              <span className="font-medium text-sm tracking-wide text-text-muted uppercase">{stat.label}</span>
            </div>
            <div className="text-4xl font-semibold text-white tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium tracking-tight text-white">Active Projects</h2>
          </div>
          <div className="space-y-5">
            {projects.slice(0, 3).map(p => (
              <div key={p.id || p._id} className="p-5 rounded-2xl bg-base border border-glass-border hover:border-violet-bloom/30 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-white group-hover:text-electric-blue transition-colors">{p.title}</h3>
                  <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-md ${p.status === 'in_progress' ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-500/20' : 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-text-muted font-light mb-4 flex gap-4">
                   <span>{p.category}</span>
                   <span>{formatCurrency(p.budget)}</span>
                </div>
                <div className="progress-bar h-1.5 bg-violet-900/30">
                  <div className="progress-fill bg-electric-blue" style={{ width: `${p.progress || 0}%` }}></div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="text-text-muted text-sm font-light">No active projects found.</div>}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-medium text-electric-blue hover:bg-blue-900/10 rounded-xl transition-colors flex items-center justify-center gap-2">
             View All Projects <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium tracking-tight text-white">Recent Activity</h2>
          </div>
          <div className="space-y-6 pt-2">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} className="flex gap-5 items-start relative">
                {i !== activities.length - 1 && <div className="absolute left-[15px] top-[30px] bottom-[-24px] w-px bg-glass-border"></div>}
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                  activity.type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' : 
                  activity.type === 'review' ? 'bg-amber-950 border-amber-500/30 text-amber-400' : 'bg-blue-950 border-blue-500/30 text-blue-400'
                }`}>
                  {activity.type === 'success' ? <Check size={14} /> : activity.type === 'review' ? <AlertCircle size={14} /> : <Info size={14} />}
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-light text-white mb-1.5 leading-relaxed">{activity.message || activity.text}</p>
                  <span className="text-xs text-text-muted tracking-wide">{activity.time || 'recently'}</span>
                </div>
              </div>
            )) : <div className="text-text-muted text-sm font-light">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
