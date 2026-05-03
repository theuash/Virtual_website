import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import { SkeletonTable } from '../../../components/ui/SkeletonLoader';
import api from '../../../services/api';
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck,
  CreditCard, Smartphone, Building2, X, CheckCircle2, Loader2
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI',          icon: <Smartphone size={18} strokeWidth={1.5} />,  desc: 'Pay via any UPI app' },
  { id: 'card',       label: 'Debit / Credit Card', icon: <CreditCard size={18} strokeWidth={1.5} />, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking',   icon: <Building2 size={18} strokeWidth={1.5} />,  desc: 'All major banks supported' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const TYPE_STYLES = {
  credit:          { color: '#10b981', label: 'Added',         icon: <ArrowDownLeft size={13} /> },
  debit:           { color: '#ef4444', label: 'Spent',         icon: <ArrowUpRight size={13} /> },
  escrow_hold:     { color: '#f59e0b', label: 'Escrow Hold',   icon: <ShieldCheck size={13} /> },
  escrow_release:  { color: '#10b981', label: 'Released',      icon: <CheckCircle2 size={13} /> },
  refund:          { color: '#3b82f6', label: 'Refund',        icon: <ArrowDownLeft size={13} /> },
};

function AddMoneyModal({ onClose, onSuccess }) {
  const [amount,   setAmount]   = useState('');
  const [method,   setMethod]   = useState('upi');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const handleAdd = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 2) return setError('Minimum add amount is 100');
    setLoading(true); setError('');
    try {
      await api.post('/client/wallet/add', { amount: amt, method });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Add Money to Wallet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount input */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block"
              style={{ color: 'var(--text-secondary)' }}>Amount ()</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <span className="text-lg font-black" style={{ color: 'var(--text-secondary)' }}></span>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" min="100"
                className="flex-1 bg-transparent text-2xl font-black outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    borderColor: amount === String(a) ? 'var(--accent)' : 'var(--border)',
                    color: amount === String(a) ? 'var(--accent)' : 'var(--text-secondary)',
                    background: 'var(--bg-card)',
                  }}>
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block"
              style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                  style={{
                    background: method === m.id ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg-card)',
                    borderColor: method === m.id ? 'var(--accent)' : 'var(--border)',
                  }}>
                  <span style={{ color: method === m.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{m.icon}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{m.desc}</div>
                  </div>
                  {method === m.id && (
                    <CheckCircle2 size={16} strokeWidth={2} className="ml-auto shrink-0" style={{ color: 'var(--accent)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={handleAdd} disabled={loading || success}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {success ? <><CheckCircle2 size={16} /> Added!</> :
             loading  ? <><Loader2 size={16} className="animate-spin" /> Processing</> :
             `Add ${parseInt(amount || 0).toLocaleString()}`}
          </button>

          <p className="text-[10px] text-center" style={{ color: 'var(--text-secondary)' }}>
            This is a simulated payment. Real payment gateway integration coming soon.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientWallet() {
  const [wallet,   setWallet]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);

  const load = () => {
    api.get('/client/wallet')
      .then(res => setWallet(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <DashboardHeader title="Wallet" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Available Balance', value: wallet?.balance ?? 0, accent: true },
            { label: 'Total Added',       value: wallet?.totalAdded ?? 0 },
          ].map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-xl border"
              style={{
                background: card.accent ? 'var(--accent)' : 'var(--bg-secondary)',
                borderColor: card.accent ? 'var(--accent)' : 'var(--border)',
              }}>
              <div className="text-[9px] font-black uppercase tracking-widest mb-2"
                style={{ color: card.accent ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                {card.label}
              </div>
              <div className="text-2xl font-black" style={{ color: card.accent ? '#fff' : 'var(--text-primary)' }}>
                {loading ? '-' : `${card.value.toLocaleString()}`}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            <Plus size={15} strokeWidth={2} /> Add Money
          </button>
        </div>



        {/* Transaction history */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Transaction History</h2>
          </div>
          {loading ? (
            <div className="p-5">
              <SkeletonTable rows={5} columns={4} />
            </div>
          ) : !wallet?.transactions?.length ? (
            <div className="py-12 text-center">
              <Wallet size={28} strokeWidth={1} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
            </div>
          ) : (
            [...wallet.transactions].reverse().map((tx, i) => {
              const style = TYPE_STYLES[tx.type] || TYPE_STYLES.credit;
              const isCredit = ['credit', 'escrow_release', 'refund'].includes(tx.type);
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${style.color}18`, color: style.color }}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {tx.description}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-sm font-black shrink-0"
                    style={{ color: isCredit ? '#10b981' : '#ef4444' }}>
                    {isCredit ? '+' : '-'}{tx.amount.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddMoneyModal onClose={() => setShowAdd(false)} onSuccess={load} />}
      </AnimatePresence>
    </>
  );
}
