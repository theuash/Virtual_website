import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Video, Calendar, Clock, Plus, X, Copy, Check,
  Loader2, AlertCircle, Users, Lock, CheckCircle2,
} from 'lucide-react';

const canSchedule = (user) =>
  user?.tier === 'project_initiator' ||
  user?.role === 'momentum_supervisor';

const STATUS_COLORS = {
  scheduled: { bg: '#3b82f611', color: '#3b82f6', label: 'Scheduled' },
  live:      { bg: '#22c55e11', color: '#22c55e', label: '🟢 Ongoing' },
  completed: { bg: '#6b728011', color: '#6b7280', label: 'Ended' },
  cancelled: { bg: '#ef444411', color: '#ef4444', label: 'Cancelled' },
};

function MeetingCard({ meeting, canJoin, onCopy, copied, onStart }) {
  const scheduled = new Date(meeting.scheduledTime);
  const isLive = meeting.status === 'live';
  const s = STATUS_COLORS[meeting.status] || STATUS_COLORS.scheduled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="h-1" style={{ background: isLive ? '#22c55e' : 'var(--accent)' }} />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{meeting.title}</p>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black shrink-0"
            style={{ background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        {meeting.description && (
          <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{meeting.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1"><Calendar size={11} />
            {scheduled.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {' · '}
            {scheduled.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1"><Clock size={11} />{meeting.duration}m</span>
          {meeting.participants?.length > 0 && (
            <span className="flex items-center gap-1"><Users size={11} />{meeting.participants.length}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {meeting.status === 'cancelled' ? (
            <div className="flex items-center gap-1.5 text-xs py-2" style={{ color: '#ef4444' }}>
              🚫 Cancelled
            </div>
          ) : meeting.status === 'completed' ? (
            <div className="flex items-center gap-1.5 text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={13} /> Meeting Ended
            </div>
          ) : (
            <>
              {/* Join button - always shown for scheduled/live, precrates can join anytime */}
              <a href={`/meet/${meeting._id}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: isLive ? '#22c55e' : 'var(--accent)', color: '#fff' }}>
                <Video size={13} /> {isLive ? 'Join Now' : canJoin ? 'Start' : 'Join'}
              </a>
              <button onClick={() => onCopy(meeting._id, `${window.location.origin}/meet/${meeting._id}`)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
                {copied === meeting._id ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Participant picker ────────────────────────────────────────────
function ParticipantPicker({ selected, onChange }) {
  const [precrates, setPrecrates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/supervisor/precrates')
      .then(res => setPrecrates(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    onChange(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  if (loading) return <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading…</div>;
  if (precrates.length === 0) return <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No freelancers found.</div>;

  return (
    <div className="space-y-1.5 max-h-40 overflow-y-auto">
      {precrates.map(f => (
        <label key={f._id} className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all"
          style={{ background: selected.includes(f._id) ? 'var(--accent)11' : 'var(--bg-card)', border: `1px solid ${selected.includes(f._id) ? 'var(--accent)' : 'var(--border)'}` }}>
          <input type="checkbox" checked={selected.includes(f._id)} onChange={() => toggle(f._id)} className="accent-[var(--accent)]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{f.fullName}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{f.email}</p>
          </div>
        </label>
      ))}
    </div>
  );
}

// ── Schedule modal ────────────────────────────────────────────────
function ScheduleModal({ onClose, onCreated, apiPath }) {
  const [form, setForm] = useState({ title: '', description: '', scheduledTime: '', duration: 30 });
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputStyle = { background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post(apiPath, { ...form, duration: Number(form.duration), participants });
      onCreated(res.data?.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to schedule meeting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-2xl border overflow-hidden pointer-events-auto"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Schedule Meeting</p>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                style={{ background: '#ef444411', color: '#ef4444', border: '1px solid #ef444433' }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Weekly Check-in" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional agenda…" rows={2} className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Date & Time *</label>
                <input required type="datetime-local" value={form.scheduledTime}
                  onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Duration</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}>
                  {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Add Participants
              </label>
              <ParticipantPicker selected={participants} onChange={setParticipants} />
              {participants.length > 0 && (
                <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{participants.length} selected</p>
              )}
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
              {saving ? 'Scheduling…' : 'Schedule Meeting'}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function FreelancerMeet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied]     = useState(null);

  const isScheduler = canSchedule(user);

  const load = async () => {
    try {
      const res = await api.get('/freelancer/meetings');
      setMeetings(res.data?.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleStart = (meeting) => navigate(`/meet/${meeting._id}`);

  return (
    <>
      <DashboardHeader title="Meetings" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isScheduler ? 'Schedule and manage video meetings.' : 'Your scheduled meetings will appear here.'}
          </p>
          {isScheduler ? (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              <Plus size={14} /> Schedule Meeting
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <Lock size={13} /> Scheduling available for Project Initiators
            </div>
          )}
        </div>

        {/* Precrate/Crate info block */}
        {!isScheduler && (
          <div className="p-4 rounded-xl border flex items-start gap-3"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <Video size={16} strokeWidth={1.5} style={{ color: 'var(--accent)', marginTop: 2 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Meetings are scheduled by your supervisor</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                When a meeting goes live, a <strong>Join Now</strong> button will appear here. You'll only see meetings you've been added to.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No meetings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {meetings.map(m => (
              <MeetingCard key={m._id} meeting={m}
                canJoin={isScheduler}
                onCopy={handleCopy} copied={copied}
                onStart={handleStart} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ScheduleModal
            apiPath="/freelancer/meetings"
            onClose={() => setShowForm(false)}
            onCreated={(m) => { setMeetings(prev => [m, ...prev]); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
