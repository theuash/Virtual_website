import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/roleGuards';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
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

  if (isLoading) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
    </>
  );
  if (isError) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8 text-red-400">Error loading dashboard data. Please ensure backend is running.</div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="p-6 rounded-xl border backdrop-blur-xl transition-all hover:border-yellow-600/30 group cursor-pointer"
              style={{ 
                backgroundColor: 'rgba(34, 42, 54, 0.3)',
                borderColor: 'var(--border-light)',
                boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'rgba(57, 17, 125, 0.15)',
                    color: 'var(--accent-light)'
                  }}
                >
                  {stat.icon}
                </div>
                <span className="font-medium text-sm uppercase" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              </div>
              <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects */}
          <div 
            className="lg:col-span-2 p-6 rounded-xl border backdrop-blur-xl transition-all"
            style={{ 
              backgroundColor: 'rgba(34, 42, 54, 0.3)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
            }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Active Projects</h2>
            <div className="space-y-3">
              {projects.slice(0, 3).map(p => (
                <div 
                  key={p.id || p._id}
                  className="p-4 rounded-lg border transition-all hover:border-yellow-600/40 hover:bg-opacity-40 cursor-pointer group"
                  style={{ 
                    backgroundColor: 'rgba(20, 28, 50, 0.4)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium group-hover:text-yellow-300 transition-colors" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded transition-all group-hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(135deg, #39117d 0%, #012f4a 100%)',
                        color: '#EDE7F6'
                      }}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs mb-3 flex gap-4" style={{ color: 'var(--text-secondary)' }}>
                    <span>{p.category}</span>
                    <span>{formatCurrency(p.budget)}</span>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(57, 17, 125, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        background: 'linear-gradient(90deg, #39117d 0%, #c084fc 100%)',
                        width: `${p.progress || 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No active projects found</div>
              )}
            </div>
            <button 
              className="w-full mt-6 py-2.5 text-sm font-medium rounded-lg border transition-all hover:bg-opacity-40 group"
              style={{ 
                color: 'var(--accent-light)',
                borderColor: 'var(--border-light)',
                backgroundColor: 'rgba(57, 17, 125, 0.05)',
              }}
            >
              View All Projects <ArrowRight size={14} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Recent Activity */}
          <div 
            className="p-6 rounded-xl border backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(34, 42, 54, 0.3)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
            }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
            <div className="space-y-4">
              {activities.length > 0 ? activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{activity.message || activity.text}</p>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>{activity.time || 'recently'}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No activity yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
