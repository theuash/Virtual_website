import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/layout/DashboardHeader';
import api from '../../services/api';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Loader2, X,
  CreditCard, Smartphone, Building2, CheckCircle2, Clock,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const WITHDRAW_METHODS = [
  { id: 'upi',         label: 'UPI',         icon: <Smartphone size={16} strokeWidth={1.5} />,  desc: 'Instant transfer to UPI ID' },
  { id: 'bank',        label: 'Bank Transfer',icon: <Building2 size={16} strokeWidth={1.5} />,  desc: '23 business days' },
  { id: 'card',        label: 'Debit Card',   icon: <CreditCard size={16} strokeWidth={1.5} />, desc: 'Transfer to linked card' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const TX_STYLES = {
  earning:    { color: '#10b981', bg: '#10b98122', label: 'Earned',    icon: <ArrowDownLeft size={13} /> },
  withdrawal: { color: '#ef4444', bg: '#ef444422', label: 'Withdrawn', icon: <ArrowUpRight size={13} /> },
  bonus:      { color: '#3b82f6', bg: '#3b82f622', label: 'Bonus',     icon: <ArrowDownLeft size={13} /> },
  deduction:  { color: '#f59e0b', bg: '#f59e0b22', label: 'Deduction', icon: <ArrowUpRight size={13} /> },
};

const STATUS_STYLES = {
  completed: { color: '#10b981', label: 'Completed' },
  pending:   { color: '#f59e0b', label: 'Pending' },
  failed:    { color: '#ef4444', label: 'Failed' },
};

function WithdrawModal({ balance, onClose, onSuccess }) {
  const { convert } = useCurrency();
  const [amount,  setAmount]  = useState('');
  const [method,  setMethod]  = useState('upi');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const handleWithdraw = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 100) return setError('Minimum withdrawal is 100');
    if (amt > balance)     return setError('Insufficient balance');
    if (!details.trim())   return setError('Please enter your account details');
    setLoading(true); setError('');
    try {
      await api.post('/crate/wallet/withdraw', { amount: amt, method, accountDetails: details });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Withdraw Earnings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <CheckCircle2 size={40} strokeWidth={1.5} className="mb-3" style={{ color: '#10b981' }} />
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Withdrawal Requested!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Funds will be transferred within 23 business days.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Available balance */}
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-card)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Available Balance</p>
              <p className="text-2xl font-black" style={{ color: '#10b981' }}>{convert(balance).display}</p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Amount ()
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <span className="text-lg font-black" style={{ color: 'var(--text-secondary)' }}></span>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" min="100" max={balance}
                  className="flex-1 bg-transparent text-2xl font-black outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                    {QUICK_AMOUNTS.filter(a => a <= balance).map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      borderColor: amount === String(a) ? 'var(--accent)' : 'var(--border)',
                      color:       amount === String(a) ? 'var(--accent)' : 'var(--text-secondary)',
                      background:  'var(--bg-card)',
                    }}
                  >
                    {a.toLocaleString()}
                  </button>
                ))}
                    {balance > 0 && (
                  <button
                    onClick={() => setAmount(String(balance))}
                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      borderColor: amount === String(balance) ? 'var(--accent)' : 'var(--border)',
                      color:       amount === String(balance) ? 'var(--accent)' : 'var(--text-secondary)',
                      background:  'var(--bg-card)',
                    }}
                    >
                    All
                    </button>
                )}
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Withdrawal Method
              </label>
              <div className="space-y-2">
                {WITHDRAW_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                    style={{
                      background:  method === m.id ? 'var(--accent)' : 'var(--bg-card)',
                      borderColor: method === m.id ? 'var(--accent)' : 'var(--border)',
                      color:       method === m.id ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    <span style={{ opacity: 0.8 }}>{m.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-[10px] opacity-70">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Account details */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                {method === 'upi' ? 'UPI ID' : method === 'bank' ? 'Account Number / IFSC' : 'Card Number (last 4 digits)'}
              </label>
              <input
                type="text" value={details} onChange={e => setDetails(e.target.value)}
                placeholder={method === 'upi' ? 'yourname@upi' : method === 'bank' ? 'XXXX XXXX XXXX / IFSC' : '   XXXX'}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {loading ? 'Processing' : `Withdraw ${convert(parseInt(amount || 0)).display}`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CrateEarnings() {
  const [wallet,  setWallet]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txFilter, setTxFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crate/wallet');
      setWallet(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const transactions = wallet?.transactions ?? [];
  const filtered = txFilter === 'all'
    ? transactions
    : transactions.filter(t => t.type === txFilter);

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <DashboardHeader title="Earnings" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
            <button onClick={load} className="mt-3 text-xs px-4 py-2 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}>Retry</button>
          </div>
        ) : (
          <>
            {/* Balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Available Balance', value: wallet?.balance ?? 0, color: '#10b981', icon: <Wallet size={18} strokeWidth={1.5} /> },
                { label: 'Total Earned',      value: wallet?.totalEarned ?? 0, color: 'var(--accent)', icon: <TrendingUp size={18} strokeWidth={1.5} /> },
                { label: 'Total Withdrawn',   value: wallet?.totalWithdrawn ?? 0, color: '#6b7280', icon: <ArrowUpRight size={18} strokeWidth={1.5} /> },
              ].map(card => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: card.color + '22', color: card.color }}>
                      {card.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                      {card.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black" style={{ color: card.color }}>
                    {convert(card.value || 0).display}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Withdraw button */}
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={(wallet?.balance ?? 0) < 100}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <ArrowUpRight size={16} strokeWidth={2} />
              Withdraw Earnings
            </button>

            {/* Transaction history */}
            <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Transaction History</h2>
                <div className="flex gap-1.5">
                  {['all', 'earning', 'withdrawal'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all capitalize"
                      style={{
                        background:  txFilter === f ? 'var(--accent)' : 'var(--bg-card)',
                        color:       txFilter === f ? '#fff' : 'var(--text-secondary)',
                        borderColor: txFilter === f ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet size={28} strokeWidth={1} className="mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {sorted.map((tx, i) => {
                    const style = TX_STYLES[tx.type] || TX_STYLES.earning;
                    const statusStyle = STATUS_STYLES[tx.status] || STATUS_STYLES.completed;
                    return (
                      <motion.div
                        key={tx._id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {tx.description || style.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold"
                              style={{ color: statusStyle.color }}
                            >
                              {tx.status === 'pending' ? <Clock size={9} /> : <CheckCircle2 size={9} />}
                              {statusStyle.label}
                            </span>
                          </div>
                        </div>
                        <p
                          className="text-sm font-black shrink-0"
                          style={{ color: style.color }}
                        >
                          {tx.type === 'withdrawal' || tx.type === 'deduction' ? '' : '+'}{convert(tx.amount || 0).display}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showWithdraw && (
          <WithdrawModal
            balance={wallet?.balance ?? 0}
            onClose={() => setShowWithdraw(false)}
            onSuccess={load}
          />
        )}
      </AnimatePresence>
    </>
  );
}
