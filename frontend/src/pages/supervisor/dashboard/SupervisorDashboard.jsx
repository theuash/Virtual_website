import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import {
  Clock, ArrowRight, Star, TrendingUp, Zap, Briefcase,
  MessageSquare, CheckCircle2, ShieldCheck, Users
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
  })
};

function StatCard({ label, value, icon, i = 0 }) {
  return (
    <motion.div
      custom={i} variants={fadeUp} initial="hidden" animate="show"
      className="p-5 rounded-xl border"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value ?? '-'}
      </div>
    </motion.div>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [clients, setClients] = useState([]);
  const [convsLoading, setConvsLoading]   = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    api.get('/messaging/conversations')
      .then(res => setConversations(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setConvsLoading(false));

    api.get('/supervisor/clients')
      .then(res => setClients(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setClientsLoading(false));
  }, []);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  const firstName   = user?.fullName?.split(' ')[0] || 'Supervisor';
  const dept        = user?.department?.replace(/_/g, ' ') || null;

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/*  Hero banner  */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="relative overflow-hidden p-6 rounded-2xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
            style={{ background: 'var(--accent)', opacity: 0.06 }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1"
                style={{ color: 'var(--accent)' }}>
                Momentum Supervisor
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-1"
                style={{ color: 'var(--text-primary)' }}>
                {firstName}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {dept ? `${dept} department` : 'All departments'}  Quality & delivery oversight
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                Active
              </div>
              <button
                onClick={() => navigate('/supervisor/messages')}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 relative"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <MessageSquare size={14} strokeWidth={1.5} />
                Messages
                {unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: '#ef4444', color: '#fff' }}>
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/*  Stats  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard i={0} label="Total Reviews"   value={user?.totalReviews   ?? 0} icon={<Star size={17} strokeWidth={1.5} />} />
          <StatCard i={1} label="Approval Rate"   value={user?.approvalRate   ? `${user.approvalRate}%` : '-'} icon={<CheckCircle2 size={17} strokeWidth={1.5} />} />
          <StatCard i={2} label="My Clients"      value={clients.length} icon={<Briefcase size={17} strokeWidth={1.5} />} />
          <StatCard i={3} label="Unread Messages" value={unreadTotal}          icon={<MessageSquare size={17} strokeWidth={1.5} />} />
        </div>

        {/*  Main grid  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent conversations - 2 cols */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            className="lg:col-span-2 rounded-xl border overflow-hidden"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <MessageSquare size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                Recent Conversations
              </h2>
              <button
                onClick={() => navigate('/supervisor/messages')}
                className="text-xs font-semibold flex items-center gap-1 transition-all hover:gap-2"
                style={{ color: 'var(--accent)' }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div>
              {convsLoading ? (
                <div className="p-5 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 rounded-lg animate-pulse"
                      style={{ background: 'var(--bg-card)' }} />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare size={28} strokeWidth={1} className="mx-auto mb-2"
                    style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No conversations yet.
                  </p>
                </div>
              ) : (
                conversations.slice(0, 5).map((conv, i) => (
                  <button
                    key={conv._id}
                    onClick={() => navigate(`/supervisor/messages?conv=${conv._id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 border-b text-left transition-all hover:bg-opacity-50 group"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: 'var(--accent)', color: '#fff' }}>
                      {(conv.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}>
                          {conv.name || 'Conversation'}
                        </span>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] shrink-0 ml-2"
                            style={{ color: 'var(--text-secondary)' }}>
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* My Clients Portfolio */}
          <motion.div
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="lg:col-span-2 rounded-xl border overflow-hidden"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <Briefcase size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                My Portfolio Clients
              </h2>
              <button
                onClick={() => navigate('/supervisor/clients')}
                className="text-xs font-semibold flex items-center gap-1 transition-all hover:gap-2"
                style={{ color: 'var(--accent)' }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div className="p-5">
              {clientsLoading ? (
                <div className="space-y-3">
                   {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-lg animate-pulse bg-white/5" />)}
                </div>
              ) : clients.length === 0 ? (
                <div className="py-8 text-center text-xs opacity-40">No clients assigned yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clients.slice(0, 4).map(client => (
                    <div 
                      key={client._id} 
                      onClick={() => navigate('/supervisor/clients')}
                      className="p-3 rounded-xl border bg-bg-card flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-all"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent shrink-0">
                         {client.fullName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{client.fullName}</span>
                            <span className="px-1 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-tighter bg-accent/10 text-accent">
                               {client.clientType || 'CG'}
                            </span>
                         </div>
                         <p className="text-[9px] font-mono opacity-40 truncate" style={{ color: 'var(--text-secondary)' }}>{client.clientId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right column - 1 col */}
          <div className="space-y-4">

            {/* Role info */}
            <motion.div
              custom={5} variants={fadeUp} initial="hidden" animate="show"
              className="p-5 rounded-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your Role
                </span>
              </div>
              <div className="space-y-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {[
                  'Review freelancer deliverables before client delivery',
                  'Enforce quality standards across your department',
                  'Facilitate dispute resolution meetings',
                  'Provide structured feedback on revisions',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} strokeWidth={2} className="mt-0.5 shrink-0"
                      style={{ color: 'var(--accent)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              custom={6} variants={fadeUp} initial="hidden" animate="show"
              className="p-5 rounded-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Quick Actions
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Open Messages',    icon: <MessageSquare size={13} />, path: '/supervisor/messages' },
                  { label: 'View Freelancers', icon: <Users size={13} />,         path: '/supervisor/freelancers' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                  >
                    <span style={{ color: 'var(--accent)' }}>{action.icon}</span>
                    {action.label}
                    <ArrowRight size={12} className="ml-auto opacity-40" />
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
