import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, TIER_LABELS } from '../../utils/roleGuards';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
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

  if (isLoading) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8" style={{ color: 'var(--text-secondary)' }}>Loading workflow...</div>
    </>
  );
  if (isError) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8 text-red-400">Error loading data. Backend connection required.</div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Rank Badge */}
        <div className="flex items-center justify-end">
          <div 
            className="px-4 py-2 rounded-full border backdrop-blur-md transition-all"
            style={{ 
              backgroundColor: 'rgba(34, 42, 54, 0.4)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(57, 17, 125, 0.08)'
            }}
          >
            <span className="uppercase font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>Rank: </span>
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent font-bold ml-2" style={{ backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.tier ? TIER_LABELS[user.tier] : 'Precrate'}
            </span>
          </div>
        </div>

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
          {/* Task Board */}
          <div 
            className="lg:col-span-2 p-6 rounded-xl border backdrop-blur-xl transition-all"
            style={{ 
              backgroundColor: 'rgba(34, 42, 54, 0.3)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Task Board</h2>
              <span 
                className="text-xs px-3 py-1 rounded-full border backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(57, 17, 125, 0.1)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--accent-light)'
                }}
              >
                {user?.primarySkill || 'Video Editing'}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task, i) => (
                <div 
                  key={task.id || task._id || i}
                  className="p-4 rounded-lg border transition-all hover:border-yellow-600/40 hover:bg-opacity-40 cursor-pointer group"
                  style={{ 
                    backgroundColor: 'rgba(20, 28, 50, 0.4)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm group-hover:text-yellow-300 transition-colors" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded transition-all group-hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(135deg, #39117d 0%, #012f4a 100%)',
                        color: '#EDE7F6'
                      }}
                    >
                      +{task.points || 0} xp
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Est: {task.estimation || '2-3 hours'}</p>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No tasks available</div>
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
              View All Tasks <ArrowRight size={14} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Progression */}
          <div 
            className="p-6 rounded-xl border backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(34, 42, 54, 0.3)',
              borderColor: 'var(--border-light)',
              boxShadow: '0 8px 32px rgba(57, 17, 125, 0.06)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Progression</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>TASKS</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-light)' }}>{completedTasks}/{metrics?.rankMeta?.nextTaskThreshold || 20}</span>
                </div>
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(57, 17, 125, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      background: 'linear-gradient(90deg, #39117d 0%, #c084fc 100%)',
                      width: `${Math.min(100, (completedTasks/(metrics?.rankMeta?.nextTaskThreshold || 20))*100)}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>EARNINGS</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(totalEarnings)}/{formatCurrency(metrics?.rankMeta?.nextEarningsThreshold || 5000)}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="h-full rounded-full" style={{ 
                    backgroundColor: 'var(--accent)', 
                    width: `${Math.min(100, (totalEarnings/(metrics?.rankMeta?.nextEarningsThreshold || 5000))*100)}%` 
                  }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {Math.min(100, Math.round((completedTasks/(metrics?.rankMeta?.nextTaskThreshold || 20))*100))}% to next rank
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
