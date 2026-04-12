import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, TIER_LABELS } from '../../utils/roleGuards';
import api from '../../services/api';
import { Crosshair, CheckCircle2, CircleDollarSign, ArrowRight } from 'lucide-react';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  
  // Fetch real database info from backend
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['freelancerDashboard', user?.id],
    queryFn: async () => {
      const res = await api.get('/freelancer/dashboard');
      return res.data;
    }
  });

  const availableTasks = metrics?.stats?.availableTasks || 0;
  const completedTasks = metrics?.stats?.completedTasks || user?.tasks || 0;
  const totalEarnings = metrics?.stats?.totalEarnings || user?.earnings || 0;
  const tasks = metrics?.tasks || [];

  const stats = [
    { label: 'Available Tasks', value: availableTasks, icon: <Crosshair size={24} strokeWidth={1.5} /> },
    { label: 'Completed Tasks', value: completedTasks, icon: <CheckCircle2 size={24} strokeWidth={1.5} /> },
    { label: 'Total Earnings', value: formatCurrency(totalEarnings), icon: <CircleDollarSign size={24} strokeWidth={1.5} /> },
  ];

  if (isLoading) return <div className="text-text-muted mt-10">Loading workflow...</div>;
  if (isError) return <div className="text-red-400 mt-10">Error loading data. Backend connection required.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
         <div>
           <h1 className="text-3xl font-medium tracking-tight text-white">Dashboard</h1>
           <p className="text-text-muted mt-2 font-light">Welcome back, {user?.name || 'Freelancer'}. Your creative queue awaits.</p>
         </div>
         <div className="px-4 py-2 rounded-full border border-violet-bloom/20 bg-violet-900/10 text-violet-light tracking-wide text-xs flex items-center gap-3">
            <span className="uppercase font-medium">Rank</span>
            <span className="bg-violet-bloom text-white px-2.5 py-0.5 rounded font-medium shadow-glow-sm">{user?.tier ? TIER_LABELS[user.tier] : 'Precrate'}</span>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-4 mb-4">
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
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-lg font-medium tracking-tight text-white">Task Board</h2>
             <span className="text-xs text-text-muted font-light px-3 py-1 bg-violet-900/10 rounded-full border border-glass-border">Discipline: <span className="text-electric-blue font-medium ml-1">{user?.skill || 'Video Editing'}</span></span>
          </div>
          <div className="space-y-4">
            {tasks.slice(0, 3).map((task, i) => (
              <div key={task.id || task._id || i} className="p-5 rounded-2xl bg-base border border-glass-border hover:border-electric-blue/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-white group-hover:text-electric-blue transition-colors text-sm">{task.title}</h3>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 border border-emerald-500/20 px-2 py-0.5 rounded">+{task.points || 0} xp</span>
                </div>
                <div className="text-xs text-text-muted font-light">Est. completion: {task.estimation || '2-3 hours'}</div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-text-muted py-8 font-light text-sm">No tasks currently available in your discipline.</div>
            )}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-medium text-electric-blue hover:bg-blue-900/10 rounded-xl transition-colors flex items-center justify-center gap-2">
            View All Tasks <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-bloom/10 rounded-full blur-[80px] pointer-events-none"></div>
          <h2 className="text-lg font-medium tracking-tight text-white mb-2 relative z-10">Ascension Path</h2>
          <p className="text-sm font-light text-text-muted mb-8 relative z-10">Next rank: <span className="text-white font-medium">{user?.tier === 'precrate' ? 'Crate' : user?.tier === 'crate' ? 'Project Initiator' : 'Momentum Supervisor'}</span></p>
          
          <div className="space-y-8 relative z-10">
             <div>
               <div className="flex justify-between text-xs tracking-wide uppercase font-medium mb-3">
                 <span className="text-text-muted">Operations ({completedTasks}/{(metrics?.rankMeta?.nextTaskThreshold || 20)})</span>
                 <span className="text-white">{Math.min(100, Math.round((completedTasks/(metrics?.rankMeta?.nextTaskThreshold || 20))*100))}%</span>
               </div>
               <div className="progress-bar h-1 bg-violet-900/30">
                 <div className="progress-fill bg-violet-light" style={{ width: `${Math.min(100, (completedTasks/(metrics?.rankMeta?.nextTaskThreshold || 20))*100)}%` }}></div>
               </div>
             </div>
             
             <div>
               <div className="flex justify-between text-xs tracking-wide uppercase font-medium mb-3">
                 <span className="text-text-muted">Capital ({formatCurrency(totalEarnings)}/{formatCurrency(metrics?.rankMeta?.nextEarningsThreshold || 5000)})</span>
                 <span className="text-white">{Math.min(100, Math.round((totalEarnings/(metrics?.rankMeta?.nextEarningsThreshold || 5000))*100))}%</span>
               </div>
               <div className="progress-bar h-1 bg-violet-900/30">
                 <div className="progress-fill bg-electric-blue" style={{ width: `${Math.min(100, (totalEarnings/(metrics?.rankMeta?.nextEarningsThreshold || 5000))*100)}%` }}></div>
               </div>
             </div>

             <div className="p-4 bg-glass-card border border-glass-border rounded-xl text-sm text-text-muted font-light leading-relaxed">
               Maintain trajectory. Progression metrics derived from live operations.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
