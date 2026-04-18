import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { ShieldCheck, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* Welcome */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            Welcome back
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {user?.fullName?.split(' ')[0] || 'Supervisor'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            You're logged in as a Momentum Supervisor.
            {user?.department && ` Department: ${user.department.replace(/_/g, ' ')}.`}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <ShieldCheck size={20} strokeWidth={1.5} />,
              label: 'Review Queue',
              desc: 'Review submitted deliverables from freelancers.',
              action: null,
            },
            {
              icon: <Users size={20} strokeWidth={1.5} />,
              label: 'Freelancers',
              desc: 'View and manage freelancers under your supervision.',
              action: () => navigate('/supervisor/freelancers'),
            },
            {
              icon: <MessageSquare size={20} strokeWidth={1.5} />,
              label: 'Messages',
              desc: 'Communicate with freelancers and clients.',
              action: () => navigate('/supervisor/messages'),
            },
          ].map((card, i) => (
            <button
              key={i}
              onClick={card.action}
              disabled={!card.action}
              className="group text-left p-5 rounded-xl border transition-all disabled:opacity-60 disabled:cursor-default"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              onMouseEnter={e => card.action && (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>
                {card.icon}
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.desc}</div>
              {card.action && (
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent)' }}>
                  Open <ArrowRight size={12} />
                </div>
              )}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
