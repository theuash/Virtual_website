import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/roleGuards';
import api from '../../services/api';
import { Users2, Server, Banknote, Scale, ArrowRight, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: adminData, isLoading, isError } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    }
  });

  const platformStats = adminData?.stats || { totalUsers: 0, activeProjects: 0, totalRevenue: 0, openDisputes: 0 };
  const incidents = adminData?.incidents || [];
  const accessLogs = adminData?.accessLogs || [];

  const stats = [
    { label: 'Total Network', value: platformStats.totalUsers.toLocaleString(), icon: <Users2 size={20} strokeWidth={1.5} />, color: 'text-zinc-300' },
    { label: 'Active Pipeline', value: platformStats.activeProjects, icon: <Server size={20} strokeWidth={1.5} />, color: 'text-zinc-300' },
    { label: 'Gross Volume', value: formatCurrency(platformStats.totalRevenue), icon: <Banknote size={20} strokeWidth={1.5} />, color: 'text-zinc-300' },
    { label: 'Open Incidents', value: platformStats.openDisputes, icon: <Scale size={20} strokeWidth={1.5} />, color: 'text-zinc-300' },
  ];

  if (isLoading) return <div className="text-zinc-500 mt-10 font-mono text-sm tracking-widest pl-6 border-l border-zinc-800">CONNECTING TO OPS CORE...</div>;
  if (isError) return <div className="text-red-500 mt-10 font-mono text-sm tracking-widest pl-6 border-l border-red-900/50">FATAL LINK ERROR. CHECK BACKEND.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end mb-10 border-b border-zinc-900 pb-6">
        <div>
           <h1 className="text-2xl font-medium text-white tracking-tight">System Telemetry</h1>
           <p className="text-zinc-500 font-light mt-1.5 text-sm">Real-time analytical overview of the Virtual platform.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 rounded-md">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase">Sys_Nominal</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xl ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}>{stat.icon}</span>
            </div>
            <div className="text-3xl font-medium tracking-tight text-white mb-2">{stat.value}</div>
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Incident Queue</h2>
             <span className={`bg-red-950/50 text-red-400 border border-red-900/50 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest`}>
               {incidents.length} FLAGS
             </span>
          </div>
          <div className="space-y-3">
             {incidents.length > 0 ? incidents.map((inc, i) => (
               <div key={i} className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-lg flex justify-between items-center">
                 <span className="text-sm font-light text-zinc-400">{inc.message}</span>
                 <button className="text-xs font-medium text-white hover:text-zinc-300 transition-colors">Review</button>
               </div>
             )) : <div className="text-zinc-500 text-sm font-light">Queue empty.</div>}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Access Logs</h2>
             <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Live Stream</span>
          </div>
          <div className="space-y-5">
             {accessLogs.length > 0 ? accessLogs.map((u, i) => (
               <div key={i} className="flex justify-between items-center pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                 <div>
                   <div className="text-sm font-medium text-white tracking-wide">{u.name || u.email}</div>
                   <div className="text-xs font-light text-zinc-500 mt-0.5">{u.role}</div>
                 </div>
                 <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600">{u.time || 'now'}</div>
               </div>
             )) : <div className="text-zinc-500 text-sm font-light">Log stream empty.</div>}
          </div>
          <button className="w-full mt-8 py-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-medium hover:text-white hover:bg-zinc-800 transition-all rounded-lg uppercase tracking-widest flex items-center justify-center gap-2">
            Open Registry <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
