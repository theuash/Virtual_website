import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCurrency } from '../../../context/CurrencyContext';
import api from '../../../services/api';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import { SkeletonDashboard } from '../../../components/ui/SkeletonLoader';
import { FolderKanban, Clock, Wallet, ArrowRight, PlusCircle, ShieldCheck, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS = {
  open:         { bg: 'rgba(110,44,242,0.1)', text: 'var(--accent)' },
  in_progress:  { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  under_review: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  completed:    { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  cancelled:    { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444' },
};

function StatCard({ label, value, icon }) {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const navigate = useNavigate();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['clientDashboard', user?._id],
    queryFn: async () => {
      const res = await api.get('/client/dashboard');
      return res.data?.data ?? res.data;
    },
  });

  const activeProjects   = dashboardData?.stats?.activeProjects   ?? 0;
  const pendingApprovals = dashboardData?.stats?.pendingApprovals ?? 0;
  const totalSpent       = dashboardData?.stats?.totalSpent       ?? 0;
  const projects         = dashboardData?.projects  ?? [];
  const activities       = dashboardData?.activities ?? [];

  if (isLoading) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        <SkeletonDashboard />
      </div>
    </>
  );

  if (isError) return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Could not load dashboard data. Make sure the backend is running.
      </div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">

        {/* Verification Banner */}
        {user?.verificationStatus !== 'verified' && (
          <div 
            className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-lg"
            style={{ 
              background: user?.verificationStatus === 'pending' ? 'var(--bg-glass)' : 'rgba(110,44,242,0.05)',
              borderColor: user?.verificationStatus === 'pending' ? 'var(--accent)' : 'var(--border)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}
              >
                {user?.verificationStatus === 'pending' ? <Clock className="animate-spin-slow" /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  {user?.verificationStatus === 'unverified' && "Complete Your Identity Verification"}
                  {user?.verificationStatus === 'pending' && "Identity Verification Pending"}
                  {user?.verificationStatus === 'on_hold' && "Verification On Hold"}
                </h3>
                <p className="text-[11px] mt-1 opacity-70 leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                  {user?.verificationStatus === 'unverified' && "To build trust and unlock full platform capabilities, please verify your account with your location and contact details."}
                  {user?.verificationStatus === 'pending' && "A Momentum Supervisor is currently reviewing your details. This usually takes 5-10 minutes."}
                  {user?.verificationStatus === 'on_hold' && "Your verification is currently paused. You can still post projects, but some features might be restricted until fully verified."}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/client/verification')}
              className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {user?.verificationStatus === 'pending' ? 'View Status' : 'Start Verification'}
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              Good to see you, {user?.fullName?.split(' ')[0] || 'there'}.
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening with your projects.
            </p>
          </div>
          <button
            onClick={() => navigate('/client/post-project')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <PlusCircle size={15} strokeWidth={2} />
            New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Active Projects"   value={activeProjects}              icon={<FolderKanban size={18} strokeWidth={1.5} />} />
          <StatCard label="Pending Approvals" value={pendingApprovals}            icon={<Clock size={18} strokeWidth={1.5} />} />
          <StatCard label="Total Spent"       value={convert(totalSpent).display}  icon={<Wallet size={18} strokeWidth={1.5} />} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active Projects */}
          <div
            className="lg:col-span-2 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Active Projects</h2>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                {projects.length} total
              </span>
            </div>

            <div className="p-5 space-y-3">
              {projects.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>No projects yet.</div>
                  <button
                    onClick={() => navigate('/client/post-project')}
                    className="text-sm font-semibold flex items-center gap-1.5 mx-auto"
                    style={{ color: 'var(--accent)' }}
                  >
                    <PlusCircle size={14} /> Post your first project
                  </button>
                </div>
              ) : projects.slice(0, 4).map(p => {
                const statusStyle = STATUS_COLORS[p.status] || STATUS_COLORS.open;
                return (
                  <div
                    key={p._id}
                    className="group p-4 rounded-lg border transition-all cursor-pointer"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    onClick={() => navigate(`/client/project/${p._id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold truncate pr-3" style={{ color: 'var(--text-primary)' }}>
                        {p.title}
                      </div>
                      <span
                        className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <span>{p.category?.replace('_', ' ')}</span>
                      <span>{convert(p.budget).display}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${p.progress ?? 0}%`, background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => navigate('/client/projects')}
                className="w-full py-2.5 text-sm font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 hover:gap-3"
                style={{ color: 'var(--accent)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                View All Projects <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Escrow notice */}
            <div
              className="p-4 rounded-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Escrow Protected</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                All project funds are held in escrow and released only after you approve the final deliverable.
              </p>
            </div>

            {/* Recent Activity */}
            <div
              className="rounded-xl border flex-1"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Activity size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  Recent Activity
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {activities.length === 0 ? (
                  <div className="py-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No activity yet.
                  </div>
                ) : activities.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: 'var(--accent)' }}
                    />
                    <div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {a.message || a.text}
                      </p>
                      <span className="text-[10px] mt-0.5 block" style={{ color: 'var(--text-secondary)' }}>
                        {a.time || 'recently'}
                      </span>
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
