import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  Users2, Loader2, AlertCircle, BookOpen, Clock, Calendar,
  X, Mail, Phone, MessageSquare, Video, Ban, RotateCcw,
  Save, ChevronRight, CheckCircle2, Circle,
} from 'lucide-react';

const SKILLS = ['video_editing', '3d_animation', 'cgi', 'script_writing', 'graphic_designing'];
const SKILL_LABELS = {
  video_editing:    'Video Editing',
  '3d_animation':   '3D Animation',
  cgi:              'CGI / VFX',
  script_writing:   'Script Writing',
  graphic_designing:'Graphic Design',
};
const HOURS_OPTIONS = [5, 10, 20, 40];
const CONTACT_TIMES = ['9am - 12pm', '12pm - 3pm', '3pm - 6pm', '6pm - 9pm', 'Flexible / Anytime'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function LearningBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Learning</span>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{completed}/{total} modules · {pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f59e0b' }} />
      </div>
    </div>
  );
}

function PrecratCard({ freelancer, index, onClick }) {
  const prog = freelancer.learningProgress || { completed: 0, total: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="rounded-xl border overflow-hidden cursor-pointer hover:border-[#f59e0b] transition-all"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="h-1 w-full" style={{ background: '#f59e0b' }} />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: '#f59e0b22', color: '#f59e0b' }}>
            {(freelancer.fullName || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{freelancer.fullName}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{freelancer.email}</p>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
          <BookOpen size={12} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {SKILL_LABELS[freelancer.primarySkill] || 'No skill set'}
          </span>
        </div>
        <LearningBar completed={prog.completed} total={prog.total} />
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <div className="text-[9px] uppercase tracking-widest font-black mb-0.5" style={{ color: 'var(--text-secondary)' }}>Hrs/Week</div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{freelancer.hoursPerWeek || '-'}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <div className="text-[9px] uppercase tracking-widest font-black mb-0.5" style={{ color: 'var(--text-secondary)' }}>Joined</div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {freelancer.createdAt ? new Date(freelancer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// -- Detail Sidebar ------------------------------------------------
function PrecratSidebar({ id, onClose, onUpdated }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState('info'); // info | edit
  const [form, setForm]       = useState({});
  const [contactDays, setContactDays] = useState([]);
  const [contactTime, setContactTime] = useState('');
  const [status, setStatus]   = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/supervisor/precrates/${id}`)
      .then(res => {
        const d = res.data?.data;
        setData(d);
        setForm({
          primarySkill:   d.primarySkill || '',
          secondarySkills: d.secondarySkills || [],
          hoursPerWeek:   d.hoursPerWeek || '',
        });
        // Parse preferredContactTime
        if (d.preferredContactTime) {
          const parts = d.preferredContactTime.split(' · ');
          if (parts.length === 2) {
            setContactDays(parts[0].split(', ').map(s => s.trim()).filter(Boolean));
            setContactTime(parts[1].trim());
          } else {
            setContactTime(d.preferredContactTime);
          }
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSecondary = (skill) => {
    if (skill === form.primarySkill) return;
    setForm(f => ({
      ...f,
      secondarySkills: f.secondarySkills.includes(skill)
        ? f.secondarySkills.filter(s => s !== skill)
        : [...f.secondarySkills, skill],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const preferredContactTime = contactDays.length > 0 && contactTime
        ? `${contactDays.join(', ')} · ${contactTime}`
        : contactTime;
      await api.patch(`/supervisor/precrates/${id}`, { ...form, preferredContactTime });
      setStatus({ type: 'success', msg: 'Saved successfully.' });
      onUpdated();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm(`${data?.isSuspended ? 'Reinstate' : 'Suspend'} ${data?.fullName}?`)) return;
    try {
      await api.post(`/supervisor/precrates/${id}/suspend`, { suspend: !data?.isSuspended });
      setData(d => ({ ...d, isSuspended: !d.isSuspended }));
      onUpdated();
    } catch (err) {
      alert(err?.response?.data?.message || 'Action failed.');
    }
  };

  const prog = data?.learningProgress || { completed: 0, total: 0 };
  const pct  = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl overflow-hidden"
      style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
          Precrate Profile
        </p>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}>
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin" style={{ color: '#f59e0b' }} />
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Could not load profile.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Avatar + name */}
          <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
                style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                {(data.fullName || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{data.fullName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{data.email}</p>
                {data.isSuspended && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: '#ef444422', color: '#ef4444' }}>SUSPENDED</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <a href={`mailto:${data.email}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
                <Mail size={13} /> Email
              </a>
              {data.phone && (
                <a href={`tel:${data.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
                  <Phone size={13} /> Call
                </a>
              )}
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                style={{ background: '#f59e0b', color: '#fff' }}>
                <Video size={13} /> Meeting
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {['info', 'edit'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
                style={{
                  color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                }}>
                {t === 'info' ? 'Overview' : 'Edit Profile'}
              </button>
            ))}
          </div>

          {/* Info tab */}
          {tab === 'info' && (
            <div className="p-5 space-y-5">
              {/* Learning progress */}
              <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Learning Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black" style={{ color: '#f59e0b' }}>{pct}%</span>
                  <span className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{prog.completed} of {prog.total} modules</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#f59e0b' }} />
                </div>
                {/* Module list */}
                {prog.records?.length > 0 && (
                  <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto">
                    {prog.records.map(r => (
                      <div key={r.tutorialId} className="flex items-center gap-2 text-xs">
                        {r.completed
                          ? <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
                          : <Circle size={12} style={{ color: 'var(--border)' }} />
                        }
                        <span className="truncate font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {r.tutorialId}
                        </span>
                        <span className="ml-auto shrink-0 text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                          {r.durationSeconds > 0 ? `${Math.round((r.watchedSeconds / r.durationSeconds) * 100)}%` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Primary Skill',   value: SKILL_LABELS[data.primarySkill] || '-' },
                  { label: 'Hrs / Week',       value: data.hoursPerWeek || '-' },
                  { label: 'Contact Window',   value: data.preferredContactTime || '-' },
                  { label: 'Phone',            value: data.phone || '-' },
                  { label: 'Joined',           value: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
                  { label: 'Verified',         value: data.isVerified ? 'Yes' : 'No' },
                ].map(row => (
                  <div key={row.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{row.label}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Secondary skills */}
              {data.secondarySkills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Secondary Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {data.secondarySkills.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                        {SKILL_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suspend / Reinstate */}
              <button onClick={handleSuspend}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all hover:opacity-80"
                style={{
                  borderColor: data.isSuspended ? '#22c55e44' : '#ef444444',
                  color: data.isSuspended ? '#22c55e' : '#ef4444',
                  background: data.isSuspended ? '#22c55e11' : '#ef444411',
                }}>
                {data.isSuspended ? <><RotateCcw size={13} /> Reinstate Freelancer</> : <><Ban size={13} /> Suspend Freelancer</>}
              </button>
            </div>
          )}

          {/* Edit tab */}
          {tab === 'edit' && (
            <div className="p-5 space-y-5">
              {status && (
                <div className="p-3 rounded-xl text-xs font-semibold"
                  style={{
                    background: status.type === 'success' ? '#22c55e11' : '#ef444411',
                    color: status.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${status.type === 'success' ? '#22c55e44' : '#ef444444'}`,
                  }}>
                  {status.msg}
                </div>
              )}

              {/* Primary skill */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Primary Skill</p>
                <div className="space-y-1.5">
                  {SKILLS.map(skill => (
                    <button key={skill} type="button"
                      onClick={() => setForm(f => ({ ...f, primarySkill: skill, secondarySkills: f.secondarySkills.filter(s => s !== skill) }))}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                      style={{
                        background: form.primarySkill === skill ? '#f59e0b' : 'var(--bg-card)',
                        borderColor: form.primarySkill === skill ? '#f59e0b' : 'var(--border)',
                        color: form.primarySkill === skill ? '#fff' : 'var(--text-primary)',
                      }}>
                      {SKILL_LABELS[skill]}
                      {form.primarySkill === skill && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary skills */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Secondary Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.filter(s => s !== form.primarySkill).map(skill => (
                    <button key={skill} type="button"
                      onClick={() => toggleSecondary(skill)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background: form.secondarySkills.includes(skill) ? '#f59e0b22' : 'var(--bg-card)',
                        borderColor: form.secondarySkills.includes(skill) ? '#f59e0b' : 'var(--border)',
                        color: form.secondarySkills.includes(skill) ? '#f59e0b' : 'var(--text-secondary)',
                      }}>
                      {form.secondarySkills.includes(skill) && '? '}{SKILL_LABELS[skill]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours per week */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Hours per Week</p>
                <div className="flex flex-wrap gap-2">
                  {HOURS_OPTIONS.map(h => (
                    <button key={h} type="button"
                      onClick={() => setForm(f => ({ ...f, hoursPerWeek: h }))}
                      className="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background: form.hoursPerWeek === h ? '#f59e0b' : 'var(--bg-card)',
                        borderColor: form.hoursPerWeek === h ? '#f59e0b' : 'var(--border)',
                        color: form.hoursPerWeek === h ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {h} hrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact days */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Contact Days</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button"
                      onClick={() => setContactDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background: contactDays.includes(day) ? '#f59e0b' : 'var(--bg-card)',
                        borderColor: contactDays.includes(day) ? '#f59e0b' : 'var(--border)',
                        color: contactDays.includes(day) ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact time */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Contact Time</p>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_TIMES.map(t => (
                    <button key={t} type="button"
                      onClick={() => setContactTime(t)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background: contactTime === t ? '#f59e0b' : 'var(--bg-card)',
                        borderColor: contactTime === t ? '#f59e0b' : 'var(--border)',
                        color: contactTime === t ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#f59e0b', color: '#fff' }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// -- Main Page -----------------------------------------------------
export default function SupervisorPrecrates() {
  const [precrates, setPrecrates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/supervisor/precrates')
      .then(res => setPrecrates(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load precrates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <DashboardHeader title="Precrates" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <Users2 size={16} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Click any card to view full profile, edit skills, or manage the freelancer.
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
        ) : precrates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users2 size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No precrate freelancers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {precrates.map((f, i) => (
              <PrecratCard key={f._id} freelancer={f} index={i} onClick={() => setSelectedId(f._id)} />
            ))}
          </div>
        )}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {selectedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setSelectedId(null)}
            />
            <PrecratSidebar
              id={selectedId}
              onClose={() => setSelectedId(null)}
              onUpdated={load}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}


