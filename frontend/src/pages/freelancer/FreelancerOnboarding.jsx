import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SKILLS, SKILL_LABELS } from '../../utils/roleGuards';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Clock, Phone, Briefcase, Layers
} from 'lucide-react';

const STEPS = [
  { id: 'skills',       label: 'Your Skills',       icon: <Briefcase size={18} strokeWidth={1.5} /> },
  { id: 'availability', label: 'Availability',       icon: <Clock size={18} strokeWidth={1.5} /> },
  { id: 'contact',      label: 'Contact Window',     icon: <Phone size={18} strokeWidth={1.5} /> },
  { id: 'confirm',      label: 'Confirm',            icon: <CheckCircle2 size={18} strokeWidth={1.5} /> },
];

const HOURS_OPTIONS = [
  { value: 5,  label: '1–5 hrs / week',   desc: 'Light availability' },
  { value: 10, label: '5–10 hrs / week',  desc: 'Part-time' },
  { value: 20, label: '10–20 hrs / week', desc: 'Regular commitment' },
  { value: 40, label: '20–40 hrs / week', desc: 'Full-time' },
];

const CONTACT_SLOTS = [
  '9am – 12pm',
  '12pm – 3pm',
  '3pm – 6pm',
  '6pm – 9pm',
  'Flexible / Anytime',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fadeSlide = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

export default function FreelancerOnboarding() {
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [primarySkill, setPrimarySkill] = useState('');
  const [secondarySkills, setSecondarySkills] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(null);
  const [contactDays, setContactDays] = useState([]);
  const [contactTime, setContactTime] = useState('');
  const [supervisorCode, setSupervisorCode] = useState(() => {
    // Pre-fill from signup page if user entered a code there
    return sessionStorage.getItem('pendingSupervisorCode') || '';
  });

  const go = (n) => { setDir(n); setStep(s => s + n); setError(''); };

  const toggleSecondary = (skill) => {
    if (skill === primarySkill) return;
    setSecondarySkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleDay = (day) => {
    setContactDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const canNext = () => {
    if (step === 0) return !!primarySkill;
    if (step === 1) return !!hoursPerWeek;
    if (step === 2) return contactDays.length > 0 && !!contactTime;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const preferredContactTime = `${contactDays.join(', ')} · ${contactTime}`;
      await api.post('/freelancer/onboarding', {
        primarySkill,
        secondarySkills,
        hoursPerWeek,
        preferredContactTime,
        ...(supervisorCode.trim() && { supervisorCode: supervisorCode.trim().toUpperCase() }),
      });
      sessionStorage.removeItem('pendingSupervisorCode');
      // Update local user state
      const stored = JSON.parse(localStorage.getItem('virtual_user') || '{}');
      const updated = { ...stored, onboardingComplete: true, primarySkill };
      localStorage.setItem('virtual_user', JSON.stringify(updated));
      setUser(updated);
      navigate('/freelancer/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 mb-12 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="Virtual"
          className="w-7 h-7"
          style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
        />
        <span className="font-black text-xl tracking-tighter" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>
          irtual
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              style={{
                background: i === step ? 'var(--accent)' : i < step ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                color: i === step ? '#fff' : i < step ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${i < step ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {i < step ? <CheckCircle2 size={11} strokeWidth={2.5} /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px" style={{ background: i < step ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-xl rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          {/* ── Step 0: Skills ─────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="skills" custom={dir} variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="p-8">
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Step 1 of 4</div>
                <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>What do you specialise in?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pick your primary skill first, then any secondary ones.</p>
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Primary Skill</div>
                <div className="grid grid-cols-1 gap-2">
                  {SKILLS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => { setPrimarySkill(skill); setSecondarySkills(prev => prev.filter(s => s !== skill)); }}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all"
                      style={{
                        background: primarySkill === skill ? 'var(--accent)' : 'var(--bg-card)',
                        borderColor: primarySkill === skill ? 'var(--accent)' : 'var(--border)',
                        color: primarySkill === skill ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      <span className="text-sm font-semibold">{SKILL_LABELS[skill]}</span>
                      {primarySkill === skill && <CheckCircle2 size={16} strokeWidth={2} />}
                    </button>
                  ))}
                </div>
              </div>

              {primarySkill && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Secondary Skills <span className="normal-case font-medium">(optional)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.filter(s => s !== primarySkill).map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSecondary(skill)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={{
                          background: secondarySkills.includes(skill) ? 'var(--bg-card)' : 'transparent',
                          borderColor: secondarySkills.includes(skill) ? 'var(--accent)' : 'var(--border)',
                          color: secondarySkills.includes(skill) ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        {secondarySkills.includes(skill) && '✓ '}{SKILL_LABELS[skill]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 1: Availability ───────────────────────────── */}
          {step === 1 && (
            <motion.div key="availability" custom={dir} variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="p-8">
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Step 2 of 4</div>
                <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>How much time can you commit?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This helps us match you with the right volume of work.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {HOURS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setHoursPerWeek(opt.value)}
                    className="flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all"
                    style={{
                      background: hoursPerWeek === opt.value ? 'var(--accent)' : 'var(--bg-card)',
                      borderColor: hoursPerWeek === opt.value ? 'var(--accent)' : 'var(--border)',
                      color: hoursPerWeek === opt.value ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    <div>
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: hoursPerWeek === opt.value ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                        {opt.desc}
                      </div>
                    </div>
                    {hoursPerWeek === opt.value && <CheckCircle2 size={18} strokeWidth={2} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Contact window ─────────────────────────── */}
          {step === 2 && (
            <motion.div key="contact" custom={dir} variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="p-8">
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Step 3 of 4</div>
                <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>When can we reach you?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll use this window to contact you about your first project assignment.</p>
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Days available</div>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className="px-4 py-2 rounded-full text-xs font-bold border transition-all"
                      style={{
                        background: contactDays.includes(day) ? 'var(--accent)' : 'var(--bg-card)',
                        borderColor: contactDays.includes(day) ? 'var(--accent)' : 'var(--border)',
                        color: contactDays.includes(day) ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Preferred time slot</div>
                <div className="grid grid-cols-1 gap-2">
                  {CONTACT_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setContactTime(slot)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all"
                      style={{
                        background: contactTime === slot ? 'var(--accent)' : 'var(--bg-card)',
                        borderColor: contactTime === slot ? 'var(--accent)' : 'var(--border)',
                        color: contactTime === slot ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      <span className="text-sm font-semibold">{slot}</span>
                      {contactTime === slot && <CheckCircle2 size={16} strokeWidth={2} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Confirm ────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="confirm" custom={dir} variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="p-8">
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Step 4 of 4</div>
                <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Looks good?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review your profile before we set you up.</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Primary Skill',   value: SKILL_LABELS[primarySkill] },
                  { label: 'Secondary Skills', value: secondarySkills.length ? secondarySkills.map(s => SKILL_LABELS[s]).join(', ') : 'None' },
                  { label: 'Weekly Hours',     value: HOURS_OPTIONS.find(o => o.value === hoursPerWeek)?.label },
                  { label: 'Contact Days',     value: contactDays.join(', ') },
                  { label: 'Contact Time',     value: contactTime },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between px-4 py-3 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span className="text-sm font-semibold text-right ml-4" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Supervisor code - optional */}
              <div className="mt-5">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Supervisor Code <span className="normal-case font-medium opacity-60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={supervisorCode}
                  onChange={e => setSupervisorCode(e.target.value.toUpperCase())}
                  placeholder="e.g. V26INMS-LUM01"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Have a code from your supervisor? Enter it here. Leave blank to be auto-assigned.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer nav */}
        <div
          className="flex items-center justify-between px-8 py-5 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => go(1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {loading ? 'Setting up...' : 'Go to Dashboard'} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
        You can update these preferences anytime in Settings.
      </p>
    </div>
  );
}
