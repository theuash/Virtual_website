import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/layout/DashboardHeader';
import api from '../../services/api';
import { Briefcase, Loader2, AlertCircle, MessageSquare, FolderKanban } from 'lucide-react';

function ClientCard({ client }) {
  const navigate = useNavigate();
  const [messaging, setMessaging] = useState(false);

  const handleMessage = async () => {
    setMessaging(true);
    try {
      const res = await api.post('/messaging/conversations', { participantId: client._id });
      navigate(`/supervisor/messages?conv=${res.data?.data?.conversationId || res.data?.data?._id}`);
    } catch {
      setMessaging(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="h-1 w-full" style={{ background: '#f59e0b' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: '#f59e0b22', color: '#f59e0b' }}>
            {(client.fullName || client.company || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {client.fullName || 'Client'}
              </p>
              {client.clientType && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-accent/10 text-accent">
                  {client.clientType}
                </span>
              )}
            </div>
            {client.companyName ? (
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{client.companyName}</p>
            ) : client.company ? (
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{client.company}</p>
            ) : null}
            <p className="text-[10px] font-mono opacity-60" style={{ color: 'var(--text-secondary)' }}>{client.clientId || client.email}</p>
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

        <div className="flex gap-2">
          <button
            onClick={handleMessage}
            disabled={messaging}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: '#f59e0b22', color: '#f59e0b' }}>
            <MessageSquare size={13} strokeWidth={1.5} />
            {messaging ? 'Opening' : 'Message'}
          </button>
          <button
            onClick={() => navigate(`/supervisor/projects?client=${client._id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <FolderKanban size={13} strokeWidth={1.5} />
            Projects
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SupervisorClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get('/supervisor/clients')
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
          <Briefcase size={16} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            All clients with active or past projects on the platform.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No clients yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Clients will appear here once they post projects.
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
