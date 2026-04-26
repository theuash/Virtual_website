import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/roleGuards';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
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
    { label: 'Total Network', value: platformStats.totalUsers.toLocaleString(), icon: <Users2 size={20} strokeWidth={1.5} /> },
    { label: 'Active Pipeline', value: platformStats.activeProjects, icon: <Server size={20} strokeWidth={1.5} /> },
    { label: 'Gross Volume', value: formatCurrency(platformStats.totalRevenue), icon: <Banknote size={20} strokeWidth={1.5} /> },
    { label: 'Open Incidents', value: platformStats.openDisputes, icon: <Scale size={20} strokeWidth={1.5} /> },
  ];

  if (isLoading) return (
    <>
      <DashboardHeader title="System Telemetry" />
      <div className="p-4 md:p-8" style={{ color: 'var(--text-secondary)' }}>Connecting to ops core...</div>
    </>
  );
  if (isError) return (
    <>
      <DashboardHeader title="System Telemetry" />
      <div className="p-4 md:p-8 text-red-400">Fatal link error. Check backend.</div>
    </>
  );

  return (
    <>
      <DashboardHeader title="System Telemetry" />
      <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Status Badge */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(34, 42, 54, 0.4)',
            borderColor: 'var(--border-light)',
            boxShadow: '0 4px 12px rgba(57, 17, 125, 0.1)'
          }}
        >
          <Activity size={14} className="animate-pulse" style={{ color: 'var(--accent-light)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>System Nominal</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="p-6 rounded-xl border backdrop-blur-xl transition-all hover:border-yellow-600/30 group"
              style={{ 
                backgroundColor: 'rgba(34, 42, 54, 0.3)',
                borderColor: 'var(--border-light)',
                boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'rgba(57, 17, 125, 0.15)',
                    color: 'var(--accent-light)'
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <p className="text-xs uppercase tracking-wider mt-2" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Queue */}
          <div 
            className="p-6 rounded-xl border backdrop-blur-xl"
            style={{ 
                backgroundColor: 'rgba(34, 42, 54, 0.3)',
                borderColor: 'var(--border-light)',
                boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Incident Queue</h2>
              <span 
                className="text-xs font-bold px-2.5 py-1 rounded"
                style={{ 
                  background: 'linear-gradient(135deg, #39117d 0%, #012f4a 100%)',
                  color: '#EDE7F6'
                }}
              >
                {incidents.length} FLAGS
              </span>
            </div>
            <div className="space-y-3">
              {incidents.length > 0 ? incidents.map((inc, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-lg border flex justify-between items-center transition-all hover:border-yellow-600/40 group"
                  style={{ 
                    backgroundColor: 'rgba(20, 28, 50, 0.4)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <span className="text-sm group-hover:text-yellow-300 transition-colors" style={{ color: 'var(--text-primary)' }}>{inc.message}</span>
                  <button 
                    className="text-xs font-medium px-3 py-1 rounded transition-all border"
                    style={{ 
                      color: 'var(--accent-light)',
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'rgba(57, 17, 125, 0.05)'
                    }}
                  >
                    Review
                  </button>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Queue empty</div>
              )}
            </div>
          </div>

          {/* Access Logs */}
          <div 
            className="p-6 rounded-xl border backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.08)',
            }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Access Logs</h2>
            <div className="space-y-4">
              {accessLogs.length > 0 ? accessLogs.slice(0, 5).map((u, i) => (
                <div 
                  key={i}
                  className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0 transition-all hover:translate-x-1"
                  style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name || u.email}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{u.role}</div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.time || 'now'}</div>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No logs</div>
              )}
            </div>
            <button className="w-full mt-6 py-2.5 text-sm font-medium rounded-lg border transition-all uppercase" 
              style={{ color: 'var(--accent)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              Open Registry <ArrowRight size={14} className="inline ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
