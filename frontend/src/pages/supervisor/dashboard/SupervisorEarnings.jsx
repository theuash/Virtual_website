import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import { TrendingUp, Loader2, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useCurrency } from '../../../context/CurrencyContext';

export default function SupervisorEarnings() {
  const { convert } = useCurrency();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/supervisor/earnings')
      .then(res => setData(res.data?.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load earnings'))
      .finally(() => setLoading(false));
  }, []);

  const wallet   = data?.wallet   || { balance: 0, totalEarned: 0, totalWithdrawn: 0 };
  const payrolls = data?.payrolls || [];

  return (
    <>
      <DashboardHeader title="Earnings" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Available Balance', value: wallet.balance,        color: '#10b981', icon: <Wallet size={18} strokeWidth={1.5} /> },
                { label: 'Total Earned',      value: wallet.totalEarned,    color: '#f59e0b', icon: <TrendingUp size={18} strokeWidth={1.5} /> },
                { label: 'Total Withdrawn',   value: wallet.totalWithdrawn, color: '#6b7280', icon: <CheckCircle2 size={18} strokeWidth={1.5} /> },
              ].map(card => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: card.color + '22', color: card.color }}>
                      {card.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                      {card.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black" style={{ color: card.color }}>
                    {convert(card.value || 0, false, true).display}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Finalized payrolls */}
            <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Finalized Payrolls ({payrolls.length})
                </h2>
              </div>
              {payrolls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp size={28} strokeWidth={1} className="mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No finalized payrolls yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {payrolls.map((p, i) => (
                    <motion.div
                      key={p._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: '#10b98122', color: '#10b981' }}>
                        <CheckCircle2 size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {p.projectId?.title || 'Project'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {p.entries?.length ?? 0} recipients  Finalized {p.finalizedAt ? new Date(p.finalizedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                      <p className="text-sm font-black shrink-0" style={{ color: '#10b981' }}>
                        {convert(p.totalBudget || p.projectId?.totalAmount || 0, false, true).display}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

