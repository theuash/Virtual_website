import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import {
  DollarSign, Loader2, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Send,
} from 'lucide-react';
import { useCurrency } from '../../../context/CurrencyContext';

const STATUS_STYLES = {
  paid:    { color: '#10b981', bg: '#10b98122', label: 'Paid' },
  pending: { color: '#f59e0b', bg: '#f59e0b22', label: 'Pending' },
  default: { color: '#6b7280', bg: '#6b728022', label: 'Unknown' },
};

function PayrollRow({ payroll }) {
  const { convert } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const isFinalized = payroll.finalized || done;
  const entries = payroll.entries || [];
  const budget = payroll.totalBudget ?? payroll.projectId?.totalAmount ?? 0;

  const handleDistribute = async () => {
    setDistributing(true);
    setError('');
    try {
      await api.post(`/supervisor/payouts/${payroll.projectId?._id || payroll.projectId}/distribute`);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Distribution failed');
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Row header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:opacity-90 transition-opacity">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {payroll.projectId?.title || 'Project'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {entries.length} recipient{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-black" style={{ color: '#f59e0b' }}>
            {convert(budget).display}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: isFinalized ? '#10b98122' : '#f59e0b22',
              color: isFinalized ? '#10b981' : '#f59e0b',
            }}>
            {isFinalized ? 'Finalized' : 'Pending'}
          </span>
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </button>

      {/* Expanded entries */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
              {entries.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No payout entries.</p>
              ) : (
                entries.map((entry, i) => {
                  const st = STATUS_STYLES[entry.status] || STATUS_STYLES.default;
                  return (
                    <div key={entry._id || i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-card)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                        {(entry.name || entry.recipientId?.fullName || 'R').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {entry.name || entry.recipientId?.fullName || 'Recipient'}
                        </p>
                        <p className="text-[10px] capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {entry.role || 'Member'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                          {convert(entry.amount || 0).display}
                        </span>
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{ background: st.bg, color: st.color }}>
                          {entry.status === 'paid' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

              {!isFinalized && entries.length > 0 && (
                <button
                  onClick={handleDistribute}
                  disabled={distributing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  style={{ background: '#f59e0b', color: '#fff' }}>
                  {distributing ? (
                    <><Loader2 size={14} className="animate-spin" /> Distributing</>
                  ) : (
                    <><Send size={14} strokeWidth={2} /> Distribute Payroll</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupervisorPayouts() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.get('/supervisor/payouts')
      .then(res => setPayrolls(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load payouts'))
      .finally(() => setLoading(false));
  }, []);

  const pending   = payrolls.filter(p => !p.finalized).length;
  const finalized = payrolls.filter(p => p.finalized).length;

  return (
    <>
      <DashboardHeader title="Payouts" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Payrolls', value: payrolls.length, color: 'var(--text-primary)' },
            { label: 'Pending',        value: pending,          color: '#f59e0b' },
            { label: 'Finalized',      value: finalized,        color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border text-center"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
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
        ) : payrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DollarSign size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No payrolls yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Payrolls will appear here once you dispatch projects with payment entries.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payrolls.map(p => <PayrollRow key={p._id} payroll={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
