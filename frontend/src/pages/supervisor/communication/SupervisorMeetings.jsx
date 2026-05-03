import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import {
  Video, Calendar, Clock, Plus, X, Copy, Check,
  Loader2, AlertCircle, Users, Link as LinkIcon, Ban, CheckCircle2,
} from 'lucide-react';

const STATUS_COLORS = {
  scheduled:  { bg: '#3b82f611', color: '#3b82f6', label: 'Scheduled' },
  live:       { bg: '#22c55e11', color: '#22c55e', label: ' Ongoing' },
  completed:  { bg: '#6b728011', color: '#6b7280', label: 'Ended' },
  cancelled:  { bg: '#ef444411', color: '#ef4444', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function MeetingCard({ meeting, onCancel, onCopy, copied }) {
  const scheduled = new Date(meeting.scheduledTime);
  const isPast = scheduled < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="h-1" style={{ background: meeting.status === 'live' ? '#22c55e' : '#f59e0b' }} />
      <div className="p-5 space-y-4">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{meeting.title}</p>
            {meeting.description && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{meeting.description}</p>
            )}
          </div>
          <StatusBadge status={meeting.status} />
        </div>

        {/* Time + duration */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <Calendar size={12} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {scheduled.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <Clock size={12} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {scheduled.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}  {meeting.duration}m
            </span>
          </div>
        </div>

        {/* Participants */}
        {meeting.participants?.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={12} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
            <>
              <button
                onClick={() => window.open(`/meet/${meeting._id}`, '_blank')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ background: meeting.status === 'live' ? '#22c55e' : '#f59e0b', color: '#fff' }}
              >
                <Video size={13} /> {meeting.status === 'live' ? 'Join Live' : 'Start'}
              </button>
              <button
                onClick={() => onCopy(meeting._id, `${window.location.origin}/meet/${meeting._id}`)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
              >
                {copied === meeting._id ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button
                onClick={() => onCancel(meeting._id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: '#ef444433', color: '#ef4444', background: '#ef444411' }}
              >
                <Ban size={13} /> Cancel
              </button>
            </>
          )}
          {(meeting.status === 'cancelled' || meeting.status === 'completed') && (
            <div className="flex items-center gap-1.5 text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
              {meeting.status === 'cancelled' ? ' Cancelled' : ' Meeting Ended'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

//  Participant picker - sectioned by role 
function ParticipantPicker({ selected, onChange }) {
  const [precrates, setPrecrates]   = useState([]);
  const [initiators, setInitiators] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/supervisor/precrates'),
      api.get('/supervisor/teams'),
    ]).then(([precratesRes, teamsRes]) => {
      setPrecrates(precratesRes.data?.data || []);
      const seen = new Set();
      const inits = [];
      for (const team of (teamsRes.data?.data || [])) {
        const ini = team.initiatorId;
        if (ini?._id && !seen.has(String(ini._id))) {
          seen.add(String(ini._id));
          inits.push(ini);
        }
      }
      setInitiators(inits);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = (id) =>
    onChange(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const PersonRow = ({ person }) => (
    <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
      style={{
        background: selected.includes(String(person._id)) ? '#f59e0b11' : 'var(--bg-primary)',
        border: `1px solid ${selected.includes(String(person._id)) ? '#f59e0b' : 'var(--border)'}`,
      }}>
      <input type="checkbox"
        checked={selected.includes(String(person._id))}
        onChange={() => toggle(String(person._id))}
        style={{ accentColor: '#f59e0b' }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{person.fullName}</p>
        <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{person.email}</p>
      </div>
    </label>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 size={18} className="animate-spin" style={{ color: '#f59e0b' }} />
    </div>
  );

  return (
    <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 2rem)' }}>
      {/* Project Initiators */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: '#f59e0b' }}>
          Project Initiators ({initiators.length})
        </p>
        {initiators.length === 0 ? (
          <p className="text-[10px] px-1" style={{ color: 'var(--text-secondary)' }}>No initiators found.</p>
        ) : (
          <div className="space-y-1.5">
            {initiators.map(p => <PersonRow key={p._id} person={p} />)}
          </div>
        )}
      </div>

      {/* Precrates */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: '#f59e0b' }}>
          Precrates ({precrates.length})
        </p>
        {precrates.length === 0 ? (
          <p className="text-[10px] px-1" style={{ color: 'var(--text-secondary)' }}>No precrates found.</p>
        ) : (
          <div className="space-y-1.5">
            {precrates.map(p => <PersonRow key={p._id} person={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupervisorMeetings() {
  const [meetings, setMeetings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', scheduledTime: '', duration: 30,
  });
  const [participants, setParticipants] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/supervisor/meetings');
      setMeetings(res.data?.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/supervisor/meetings', {
        title:         form.title,
        description:   form.description,
        scheduledTime: form.scheduledTime,
        duration:      Number(form.duration),
        participants,
      });
      setShowForm(false);
      setForm({ title: '', description: '', scheduledTime: '', duration: 30 });
      setParticipants([]);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to schedule meeting.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this meeting?')) return;
    try {
      await api.post(`/supervisor/meetings/${id}/cancel`);
      setMeetings(prev => prev.map(m => m._id === id ? { ...m, status: 'cancelled' } : m));
    } catch { /* silent */ }
  };

  const handleCopy = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const upcoming = meetings.filter(m => m.status === 'scheduled' || m.status === 'live');
  const past     = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  const inputStyle = {
    background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)',
  };

  return (
    <>
      <DashboardHeader title="Meetings" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Schedule and manage meetings with your precrate freelancers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90"
            style={{ background: '#f59e0b', color: '#fff' }}
          >
            <Plus size={14} /> Schedule Meeting
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: '#f59e0b' }} />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No meetings yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Schedule your first meeting with a precrate freelancer.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Upcoming</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {upcoming.map(m => (
                    <MeetingCard key={m._id} meeting={m} onCancel={handleCancel} onCopy={handleCopy} copied={copied} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Past</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {past.map(m => (
                    <MeetingCard key={m._id} meeting={m} onCancel={handleCancel} onCopy={handleCopy} copied={copied} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Wide two-column modal */}
              <div className="w-full max-w-3xl rounded-2xl border overflow-hidden flex flex-col"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', maxHeight: '90vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    Schedule Meeting
                  </p>
                  <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)' }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Two-column body */}
                <div className="flex flex-1 overflow-hidden">

                  {/* Left - form */}
                  <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4 overflow-y-auto border-r" style={{ borderColor: 'var(--border)' }}>
                    {error && (
                      <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                        style={{ background: '#ef444411', color: '#ef4444', border: '1px solid #ef444433' }}>
                        <AlertCircle size={13} /> {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                      <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Weekly Check-in"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Description</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Optional agenda or notes" rows={2}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                        style={inputStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Date & Time *</label>
                        <input required type="datetime-local" value={form.scheduledTime}
                          onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                          style={inputStyle} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Duration (min)</label>
                        <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                          style={inputStyle}>
                          {[15, 30, 45, 60, 90, 120].map(d => (
                            <option key={d} value={d}>{d} min</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {participants.length > 0 && (
                      <p className="text-[10px] font-semibold" style={{ color: '#f59e0b' }}>
                        {participants.length} participant{participants.length !== 1 ? 's' : ''} selected
                      </p>
                    )}

                    <button type="submit" disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: '#f59e0b', color: '#fff' }}>
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
                      {saving ? 'Scheduling' : 'Schedule Meeting'}
                    </button>
                  </form>

                  {/* Right - participant list */}
                  <div className="w-64 shrink-0 flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                        Add Participants
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      <ParticipantPicker selected={participants} onChange={setParticipants} />
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
