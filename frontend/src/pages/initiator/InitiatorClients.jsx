import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/layout/DashboardHeader';
import api from '../../services/api';
import { UserCheck, Loader2, AlertCircle, MessageSquare } from 'lucide-react';

function Avatar({ name = '?', color = '#3b82f6', size = 10 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-black shrink-0`}
      style={{ background: color, color: '#fff' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ClientCard({ client }) {
  const navigate = useNavigate();
  const [messaging, setMessaging] = useState(false);

  const handleMessage = async () => {
    setMessaging(true);
    try {
      const res = await api.post(`/crate/freelancers/${client._id}/message`);
      navigate(`/initiator/messages?conv=${res.data?.data?.conversationId}`);
    } catch {
      setMessaging(false);
    }
  };

  return (
    <motion.div whileHover={{ y: -2 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#3b82f6' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={client.fullName || client.company || 'C'} size={10} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {client.fullName || 'Client'}
            </p>
            {client.company && (
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{client.company}</p>
            )}
            <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{client.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-lg font-black" style={{ color: '#f59e0b' }}>{client.activeProjects ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Active</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{client.totalProjects ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Total</p>
          </div>
        </div>

        <button onClick={handleMessage} disabled={messaging}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: '#3b82f622', color: '#3b82f6' }}>
          <MessageSquare size={14} />
          {messaging ? 'Opening' : 'Message Client'}
        </button>
      </div>
    </motion.div>
  );
}

export default function InitiatorClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get('/initiator/clients')
      .then(res => setClients(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardHeader title="Clients" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        <div className="flex items-center gap-2 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <UserCheck size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Clients assigned to you directly or via a Momentum Supervisor.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserCheck size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No clients assigned yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Clients will appear here once assigned by a Momentum Supervisor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map(c => <ClientCard key={c._id} client={c} />)}
          </div>
        )}
      </div>
    </>
  );
}
