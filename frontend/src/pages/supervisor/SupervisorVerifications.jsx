import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
import { ShieldCheck, User, MapPin, Phone, Clock, MessageSquare, Check, X, AlertCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SupervisorVerifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState({}); // { clientId: type }

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['supervisorVerifications'],
    queryFn: async () => {
      const res = await api.get('/supervisor/verifications');
      return res.data?.data || [];
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const clientType = selectedTypes[id] || 'CG';
      await api.post(`/supervisor/verifications/${id}/verify`, { status, clientType });
    },
    onSuccess: (_, variables) => {
      toast.success(`Client ${variables.status === 'verified' ? 'verified' : 'rejected'}`);
      queryClient.invalidateQueries(['supervisorVerifications']);
    },
    onError: () => toast.error('Action failed')
  });

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.verificationStatus === filter;
  });

  return (
    <>
      <DashboardHeader title="Verification Portal" />
      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Pending Requests</h2>
            <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--text-secondary)' }}>Review client details and verify their identity.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-accent text-white' : 'bg-white/5 border border-white/5 opacity-60'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-accent text-white' : 'bg-white/5 border border-white/5 opacity-60'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('on_hold')}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'on_hold' ? 'bg-accent text-white' : 'bg-white/5 border border-white/5 opacity-60'}`}
            >
              On Hold
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold opacity-40">No pending verification requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={req._id}
                className="p-6 rounded-3xl border relative overflow-hidden group"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                {/* Status Badge */}
                <div 
                  className="absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase tracking-widest"
                  style={{ 
                    background: req.verificationStatus === 'pending' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                    color: req.verificationStatus === 'pending' ? '#3b82f6' : '#f59e0b'
                  }}
                >
                  {req.verificationStatus}
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{req.fullName}</h3>
                    <p className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>{req.email}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="opacity-40" />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{req.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="opacity-40" />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{req.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={14} className="opacity-40 mt-0.5" />
                    <div className="text-[11px] leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                       {req.address}
                    </div>
                  </div>
                </div>

                {/* Type Selection */}
                <div className="mb-6">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block" style={{ color: 'var(--text-primary)' }}>Designate Account Tier</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CG', label: 'Regular' },
                      { id: 'CP', label: 'Permanent' },
                      { id: 'CS', label: 'Special' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTypes({ ...selectedTypes, [req._id]: t.id })}
                        className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          (selectedTypes[req._id] || 'CG') === t.id 
                            ? 'bg-accent text-white border-accent' 
                            : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'
                        }`}
                      >
                        {t.id}: {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => verifyMutation.mutate({ id: req._id, status: 'verified' })}
                    className="flex-1 h-11 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95"
                  >
                    <Check size={14} /> Verify Account
                  </button>
                  <button 
                    onClick={() => navigate('/supervisor/messages')}
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-accent transition-all hover:bg-accent/10"
                    title="Chat with Client"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    onClick={() => verifyMutation.mutate({ id: req._id, status: 'unverified' })}
                    className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 transition-all hover:bg-red-500 hover:text-white"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
          <AlertCircle size={24} className="text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>Supervisor Protocol</h4>
            <p className="text-xs leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
              Verifying a client assigns them to your portfolio. Ensure the location data and phone number provided match standard business logic for the respective country before approval. Use the chat feature if identity clarification is required.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
