import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  ArrowRight, ArrowLeft, Info, Clock, Zap, Star, Shield,
  CheckCircle2, Search, X, Plus, Loader2, AlertCircle,
} from 'lucide-react';

// ─── Pricing Catalogue ───────────────────────────────────────────────────────
// Removed — now fetched live from /api/pricing/catalogue

const SKILL_LABELS = {
  video_editing:     'Video Editing',
  '3d_animation':    '3D Animation',
  cgi:               'CGI / VFX',
  script_writing:    'Script Writing',
  graphic_designing: 'Graphic Design',
};

const SOFTWARE_OPTIONS = [
  'Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut',
  'Adobe After Effects', 'Blender', 'Cinema 4D', 'Maya', '3ds Max', 'Houdini',
  'Nuke', 'Fusion', 'Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Canva',
  'Adobe InDesign', 'CorelDRAW', 'Affinity Designer', 'Affinity Photo', 'Sketch',
  'Adobe XD', 'Final Draft', 'Celtx', 'Arc Studio', 'Adobe Audition', 'Logic Pro',
  'Pro Tools', 'Audacity', 'GarageBand', 'Unreal Engine', 'Unity', 'ZBrush',
  'Substance Painter', 'Marvelous Designer', 'SketchUp', 'AutoCAD', 'Rhino 3D',
  'KeyShot', 'Octane Render',
];

const PLATFORM_FEE_RATE  = 0.05;
const TIME_SENSITIVE_RATE = 0.60;
const DEPOSIT_RATE        = 0.30;

const STEP_LABELS = [
  'Choose Path',
  'Project Details',
  'Service / Budget',
  'Extras',
  'Review & Submit',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="ml-1.5 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Info size={13} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-xs leading-relaxed p-3 rounded-xl shadow-xl z-50 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function Toggle({ checked, onChange, label, info }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
        {info && <Tooltip text={info} />}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2"
        style={{
          background: checked ? 'var(--accent)' : 'var(--border)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  );
}

function InputField({ label, info, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
        {info && <Tooltip text={info} />}
      </label>
      {children}
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2';
const inputStyle = {
  background: 'var(--bg-card)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
};

// ─── Step 0 – Choose Path ────────────────────────────────────────────────────
function StepChoosePath({ onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          How would you like to post?
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Choose a path that fits your project best.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Service-based */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('service')}
          className="text-left p-6 rounded-2xl border-2 transition-all space-y-4 group"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(110,44,242,0.12)', color: 'var(--accent)' }}
          >
            <Star size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Post from Our Services
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Pick from our curated pricing catalogue. Transparent rates per minute, second, or unit — no surprises.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Video Editing', '3D Animation', 'CGI / VFX', 'Script Writing', 'Graphic Design'].map(c => (
              <span
                key={c}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
              >
                {c}
              </span>
            ))}
          </div>
          <div
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            Select <ArrowRight size={14} />
          </div>
        </motion.button>

        {/* Open project */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('open')}
          className="text-left p-6 rounded-2xl border-2 transition-all space-y-4 group"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
          >
            <Zap size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Open Project
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Set your own budget per minute or second. Great for custom scopes or when you already know your rate.
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#3b82f6' }}
          >
            Select <ArrowRight size={14} />
          </div>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Step 1 – Project Details ─────────────────────────────────────────────────
function StepProjectDetails({ form, setForm, errors }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Project Details</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tell us about your project.</p>
      </div>

      <InputField label="Project Title" error={errors.title}>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. YouTube vlog edit — 10 min"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          maxLength={120}
        />
      </InputField>

      <InputField label="Description" error={errors.description}>
        <textarea
          className={inputCls}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
          placeholder="Describe what you need, style references, tone, deliverables…"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
        />
      </InputField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Start Date" error={errors.startDate}>
          <input
            type="date"
            className={inputCls}
            style={inputStyle}
            min={minDate()}
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
          />
        </InputField>

        <InputField label="Duration (days)" error={errors.duration}>
          <input
            type="number"
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. 7"
            min={1}
            max={365}
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
          />
        </InputField>
      </div>

      <div
        className="p-4 rounded-xl border space-y-4"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <Toggle
          checked={form.timeSensitive}
          onChange={v => setForm(f => ({ ...f, timeSensitive: v }))}
          label="Time-Sensitive"
          info="Project delivered on priority. Rate increases by +60%. Final price negotiated with Momentum Supervisor."
        />
        {form.timeSensitive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 text-xs leading-relaxed p-3 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}
          >
            <Clock size={13} className="mt-0.5 shrink-0" />
            A +60% surcharge applies to the base amount for priority delivery.
          </motion.div>
        )}

        <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <Toggle
            checked={form.ndaRequired}
            onChange={v => setForm(f => ({ ...f, ndaRequired: v }))}
            label="NDA Required"
            info="A Non-Disclosure Agreement ensures all parties keep project details confidential. Recommended for sensitive or proprietary work."
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 – Service Selection (service mode) ────────────────────────────────
// ─── Step 2 – Service Selection (service mode) — fetches from pricing DB ─────
function StepServiceSelection({ selectedDept, setSelectedDept, selectedService, setSelectedService, form, setForm, errors }) {
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/pricing/catalogue')
      .then(res => {
        // catalogue is { [skill]: { [software]: [...] } } — flatten to dept list
        const raw = res.data?.data ?? {};
        const depts = Object.entries(raw).map(([skill, softwareMap]) => ({
          dept: skill,
          label: SKILL_LABELS[skill] || skill,
          // Flatten all services across all software for this skill
          services: Object.values(softwareMap).flat().map(v => ({
            id:        v.id || v._id,
            name:      v.title || v.name,
            rate:      v.rate,
            unit:      v.unit,
            tolerance: v.tolerance || '',
            software:  v.software || '',
          })),
        }));
        setCatalogue(depts);
        if (!selectedDept && depts.length > 0) setSelectedDept(depts[0].dept);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dept = catalogue.find(c => c.dept === selectedDept) || catalogue[0];

  if (loading) return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Select a Service</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick the department and service from our pricing catalogue.
        </p>
      </div>

      {/* Department tabs */}
      <div className="flex flex-wrap gap-2">
        {catalogue.map(c => (
          <button
            key={c.dept}
            type="button"
            onClick={() => { setSelectedDept(c.dept); setSelectedService(null); }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={
              selectedDept === c.dept
                ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                : { background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Service cards */}
      {dept && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {dept.services.map(svc => {
            const active = selectedService?.id === svc.id;
            return (
              <motion.button
                key={svc.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedService(svc)}
                className="text-left p-4 rounded-xl border-2 transition-all"
                style={{
                  background: active ? 'rgba(110,44,242,0.08)' : 'var(--bg-secondary)',
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold leading-snug block" style={{ color: 'var(--text-primary)' }}>
                      {svc.name}
                    </span>
                    {svc.software && (
                      <span className="text-[10px] mt-0.5 block" style={{ color: 'var(--text-secondary)' }}>
                        {svc.software}
                      </span>
                    )}
                  </div>
                  {active && <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold text-sm" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                    ₹{svc.rate}
                  </span>
                  <span>/ {svc.unit}</span>
                  {svc.tolerance && <span className="ml-auto opacity-60">{svc.tolerance}</span>}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Quantity input */}
      {selectedService && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
          <InputField
            label={`Quantity (${selectedService.unit}s)`}
            info={selectedService.tolerance ? `Tolerance: ${selectedService.tolerance}` : undefined}
            error={errors.quantity}
          >
            <input
              type="number"
              className={inputCls}
              style={inputStyle}
              placeholder={`How many ${selectedService.unit}s?`}
              min={0.1}
              step={0.1}
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            />
          </InputField>
          {form.quantity && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Estimated base:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                ₹{(selectedService.rate * parseFloat(form.quantity || 0)).toLocaleString('en-IN')}
              </strong>
            </p>
          )}
        </motion.div>
      )}

      {errors.service && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
          <AlertCircle size={11} /> {errors.service}
        </p>
      )}
    </div>
  );
}

// ─── Step 2 – Open Project (tag-based) ───────────────────────────────────────
function StepOpenBudget({ form, setForm, errors }) {
  const [tagInput, setTagInput] = useState('');

  const SUGGESTED_TAGS = [
    'Video Editing', 'Color Grading', 'Motion Graphics', 'Sound Design',
    '3D Animation', 'Character Rigging', 'Product Visualization',
    'Green Screen', 'VFX Compositing', 'Rotoscoping',
    'Logo Design', 'Social Media Graphics', 'Brand Identity',
    'YouTube Thumbnail', 'Infographic',
    'Script Writing', 'Voiceover Script', 'Documentary Script',
  ];

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t || form.openTags?.includes(t)) return;
    setForm(f => ({ ...f, openTags: [...(f.openTags || []), t] }));
    setTagInput('');
  };

  const removeTag = (tag) => {
    setForm(f => ({ ...f, openTags: (f.openTags || []).filter(t => t !== tag) }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && form.openTags?.length) {
      removeTag(form.openTags[form.openTags.length - 1]);
    }
  };

  const unusedSuggestions = SUGGESTED_TAGS.filter(t => !(form.openTags || []).includes(t));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Describe Your Project</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Add tags for what you need and set your budget. We'll match the right team.
        </p>
      </div>

      {/* Tag input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Project Tags
        </label>

        {/* Tag chips + input */}
        <div
          className="flex flex-wrap gap-2 p-3 rounded-xl border min-h-[52px] cursor-text"
          style={{ background: 'var(--bg-card)', borderColor: errors.openTags ? '#ef4444' : 'var(--border)' }}
          onClick={() => document.getElementById('tag-input')?.focus()}
        >
          {(form.openTags || []).map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70 transition-opacity">
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <input
            id="tag-input"
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={(form.openTags || []).length === 0 ? 'Type a tag and press Enter…' : ''}
            className="flex-1 bg-transparent text-sm outline-none min-w-[120px]"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        {errors.openTags && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle size={11} /> {errors.openTags}
          </p>
        )}

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {unusedSuggestions.slice(0, 12).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:border-accent hover:text-accent"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
                >
                  <Plus size={10} strokeWidth={2.5} /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Budget Amount (₹)" error={errors.openBudget}>
          <input
            type="number"
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. 5000"
            min={1}
            value={form.openBudget}
            onChange={e => setForm(f => ({ ...f, openBudget: e.target.value }))}
          />
        </InputField>

        <InputField label="Rate Unit">
          <div className="flex gap-2 h-full">
            {['min', 'sec'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setForm(f => ({ ...f, openUnit: u }))}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
                style={
                  form.openUnit === u
                    ? { background: 'rgba(110,44,242,0.08)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                    : { background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
              >
                Per {u === 'min' ? 'Minute' : 'Second'}
              </button>
            ))}
          </div>
        </InputField>
      </div>

      <div
        className="flex items-start gap-2 text-xs leading-relaxed p-3 rounded-xl border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <Info size={13} className="mt-0.5 shrink-0" />
        +/- 30 sec tolerance applies. Platform fee of 5% will be added at checkout.
      </div>
    </div>
  );
}

// ─── Step 3 – Extras ──────────────────────────────────────────────────────────
function StepExtras({ form, setForm, softwareSearch, setSoftwareSearch, pricing, errors }) {
  const filtered = SOFTWARE_OPTIONS.filter(
    s => s.toLowerCase().includes(softwareSearch.toLowerCase()) && !form.preferredSoftware.includes(s)
  );

  const addSoftware = (s) => {
    setForm(f => ({ ...f, preferredSoftware: [...f.preferredSoftware, s] }));
    setSoftwareSearch('');
  };

  const removeSoftware = (s) => {
    setForm(f => ({ ...f, preferredSoftware: f.preferredSoftware.filter(x => x !== s) }));
  };

  const addRefLink = () => {
    setForm(f => ({ ...f, referenceLinks: [...f.referenceLinks, ''] }));
  };

  const updateRefLink = (i, val) => {
    setForm(f => {
      const links = [...f.referenceLinks];
      links[i] = val;
      return { ...f, referenceLinks: links };
    });
  };

  const removeRefLink = (i) => {
    setForm(f => ({ ...f, referenceLinks: f.referenceLinks.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Extras</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Optional details that help us match the right talent.</p>
      </div>

      {/* Preferred Software */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Preferred Software
        </label>

        {/* Selected chips */}
        {form.preferredSoftware.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.preferredSoftware.map(s => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{ background: 'rgba(110,44,242,0.08)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                {s}
                <button type="button" onClick={() => removeSoftware(s)} className="hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" style={{ color: 'var(--text-secondary)' }} />
          <input
            className={inputCls + ' pl-9'}
            style={inputStyle}
            placeholder="Search software…"
            value={softwareSearch}
            onChange={e => setSoftwareSearch(e.target.value)}
          />
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {softwareSearch && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border overflow-hidden shadow-lg"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {filtered.slice(0, 8).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSoftware(s)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(110,44,242,0.06)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference Links */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Reference Links
        </label>
        {form.referenceLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="https://…"
              value={link}
              onChange={e => updateRefLink(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeRefLink(i)}
              className="p-3 rounded-xl border transition-all hover:opacity-70"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRefLink}
          className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          <Plus size={13} /> Add link
        </button>
      </div>

      {/* Experience Format */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Experience Format
        </label>
        {errors.experienceFormat && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
            <AlertCircle size={11} /> {errors.experienceFormat}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Elite */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setForm(f => ({ ...f, experienceFormat: 'elite' }))}
            className="text-left p-5 rounded-2xl border-2 transition-all space-y-3"
            style={{
              background: form.experienceFormat === 'elite' ? 'rgba(110,44,242,0.08)' : 'var(--bg-secondary)',
              borderColor: form.experienceFormat === 'elite' ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Elite</span>
              </div>
              {form.experienceFormat === 'elite' && <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Standard pricing. Ready to checkout immediately.
            </p>
            {pricing.total > 0 && (
              <div className="text-sm font-black" style={{ color: 'var(--accent)' }}>
                {fmt(pricing.total)}
              </div>
            )}
          </motion.button>

          {/* Priority */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setForm(f => ({ ...f, experienceFormat: 'priority' }))}
            className="text-left p-5 rounded-2xl border-2 transition-all space-y-3"
            style={{
              background: form.experienceFormat === 'priority' ? 'rgba(59,130,246,0.08)' : 'var(--bg-secondary)',
              borderColor: form.experienceFormat === 'priority' ? '#3b82f6' : 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: '#3b82f6' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Priority</span>
              </div>
              {form.experienceFormat === 'priority' && <CheckCircle2 size={16} style={{ color: '#3b82f6' }} />}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Connect with a Momentum Supervisor first. Best for complex or custom projects.
            </p>
            <div className="text-sm font-bold" style={{ color: '#3b82f6' }}>
              Price TBD after consultation
            </div>
          </motion.button>
        </div>
      </div>

      {/* Attachments note */}
      <div
        className="flex items-start gap-2 text-xs leading-relaxed p-3 rounded-xl border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <Info size={13} className="mt-0.5 shrink-0" />
        You can attach files after the project is created.
      </div>
    </div>
  );
}

// ─── Step 4 – Review & Submit ─────────────────────────────────────────────────
function StepReview({ form, mode, selectedService, pricing, loading, error, onSubmit }) {
  const rows = [
    { label: 'Base Amount',        value: fmt(pricing.base) },
    ...(pricing.timeFee > 0 ? [{ label: 'Time-Sensitive (+60%)', value: fmt(pricing.timeFee), accent: '#f59e0b' }] : []),
    { label: 'Platform Fee (+5%)', value: fmt(pricing.platformFee) },
    { label: 'Total',              value: fmt(pricing.total), bold: true },
    { label: 'Deposit Due (30%)',  value: fmt(pricing.deposit), accent: 'var(--accent)' },
    { label: 'Remaining (70%)',    value: fmt(pricing.total - pricing.deposit), muted: true },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Review & Submit</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Double-check everything before posting.</p>
      </div>

      {/* Project info */}
      <div
        className="rounded-xl border divide-y"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {[
          { label: 'Title',       value: form.title },
          { label: 'Description', value: form.description, multiline: true },
          { label: 'Start Date',  value: form.startDate },
          { label: 'Duration',    value: form.duration ? `${form.duration} days` : '—' },
          {
            label: 'Service',
            value: mode === 'service' && selectedService
              ? `${selectedService.name} — ${fmt(selectedService.rate)} / ${selectedService.unit} × ${form.quantity || 0}`
              : mode === 'open'
              ? `Open Budget — ${fmt(form.openBudget || 0)} / ${form.openUnit}`
              : '—',
          },
          { label: 'Time-Sensitive', value: form.timeSensitive ? 'Yes (+60%)' : 'No' },
          { label: 'NDA Required',   value: form.ndaRequired ? 'Yes' : 'No' },
          { label: 'Experience',     value: form.experienceFormat === 'elite' ? 'Elite' : 'Priority (consultation)' },
          ...(form.preferredSoftware.length > 0
            ? [{ label: 'Software', value: form.preferredSoftware.join(', ') }]
            : []),
        ].map(row => (
          <div key={row.label} className="px-5 py-3 flex gap-4" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-semibold w-32 shrink-0 pt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
            <span
              className="text-sm flex-1"
              style={{ color: 'var(--text-primary)', whiteSpace: row.multiline ? 'pre-wrap' : 'normal', wordBreak: 'break-word' }}
            >
              {row.value || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Pricing breakdown */}
      {form.experienceFormat === 'elite' && pricing.total > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Pricing Breakdown
            </span>
          </div>
          {rows.map(row => (
            <div
              key={row.label}
              className="px-5 py-3 flex items-center justify-between border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-sm" style={{ color: row.muted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                {row.label}
              </span>
              <span
                className={row.bold ? 'text-base font-black' : 'text-sm font-semibold'}
                style={{ color: row.accent || (row.bold ? 'var(--text-primary)' : 'var(--text-secondary)') }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div
            className="px-5 py-3 text-xs"
            style={{ background: 'rgba(110,44,242,0.05)', color: 'var(--text-secondary)' }}
          >
            Deposit of <strong style={{ color: 'var(--accent)' }}>{fmt(pricing.deposit)}</strong> is due after an initiator is assigned. Remaining 70% released on completion.
          </div>
        </div>
      )}

      {form.experienceFormat === 'priority' && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' }}
        >
          <Shield size={16} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">
            A Momentum Supervisor will reach out to discuss scope and finalize pricing before the project goes live.
          </p>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl border text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {loading ? 'Posting…' : 'Post Project'}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostProject() {
  const navigate = useNavigate();

  const [step, setStep]                   = useState(0);
  const [mode, setMode]                   = useState(null);          // 'service' | 'open'
  const [selectedDept, setSelectedDept]   = useState(PRICING_CATALOGUE[0].dept);
  const [selectedService, setSelectedService] = useState(null);
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [submitted, setSubmitted]         = useState(false);
  const [direction, setDirection]         = useState(1); // 1 = forward, -1 = back

  const [form, setForm] = useState({
    title:             '',
    description:       '',
    startDate:         '',
    duration:          '',
    timeSensitive:     false,
    ndaRequired:       false,
    quantity:          '',
    openBudget:        '',
    openUnit:          'min',
    openTags:          [],
    preferredSoftware: [],
    referenceLinks:    [],
    experienceFormat:  '',
  });

  const [errors, setErrors] = useState({});

  // ── Pricing ──────────────────────────────────────────────────────────────
  const calcPricing = () => {
    let base = 0;
    if (mode === 'service' && selectedService && form.quantity) {
      base = selectedService.rate * parseFloat(form.quantity);
    } else if (mode === 'open' && form.openBudget) {
      base = parseFloat(form.openBudget);
    }
    const timeFee    = form.timeSensitive ? Math.round(base * TIME_SENSITIVE_RATE) : 0;
    const subtotal   = base + timeFee;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const total      = subtotal + platformFee;
    const deposit    = Math.round(total * DEPOSIT_RATE);
    return { base, timeFee, subtotal, platformFee, total, deposit };
  };

  const pricing = calcPricing();

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (targetStep) => {
    const errs = {};

    if (targetStep >= 1) {
      // step 1 fields
      if (!form.title.trim())       errs.title       = 'Title is required.';
      if (!form.description.trim()) errs.description = 'Description is required.';
      if (!form.startDate)          errs.startDate   = 'Start date is required.';
      if (!form.duration || Number(form.duration) < 1) errs.duration = 'Enter a valid duration.';
    }

    if (targetStep >= 2) {
      if (mode === 'service') {
        if (!selectedService)                          errs.service  = 'Please select a service.';
        if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Enter a valid quantity.';
      } else if (mode === 'open') {
        if (!form.openTags?.length)                    errs.openTags  = 'Add at least one tag describing what you need.';
        if (!form.openBudget || Number(form.openBudget) <= 0) errs.openBudget = 'Enter a valid budget.';
      }
    }

    if (targetStep >= 3) {
      if (!form.experienceFormat) errs.experienceFormat = 'Please choose an experience format.';
    }

    return errs;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    const errs = validate(step + 1);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setDirection(-1);
    setStep(s => s - 1);
  };

  const handleModeSelect = (m) => {
    setMode(m);
    setDirection(1);
    setStep(1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate(4);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setError('');
    try {
      const p = calcPricing();
      await api.post('/client/projects', {
        title:             form.title,
        description:       form.description,
        startDate:         form.startDate,
        duration:          Number(form.duration),
        timeSensitive:     form.timeSensitive,
        ndaRequired:       form.ndaRequired,
        mode,
        department:        mode === 'service' ? selectedDept : undefined,
        serviceId:         mode === 'service' ? selectedService?.id : undefined,
        serviceName:       mode === 'service' ? selectedService?.name : undefined,
        quantity:          mode === 'service' ? parseFloat(form.quantity) : undefined,
        unit:              mode === 'service' ? selectedService?.unit : form.openUnit,
        openBudget:        mode === 'open' ? parseFloat(form.openBudget) : undefined,
        openUnit:          mode === 'open' ? form.openUnit : undefined,
        openTags:          mode === 'open' ? form.openTags : undefined,
        preferredSoftware: form.preferredSoftware,
        referenceLinks:    form.referenceLinks.filter(l => l.trim()),
        experienceFormat:  form.experienceFormat,
        pricing: {
          base:        p.base,
          timeFee:     p.timeFee,
          platformFee: p.platformFee,
          total:       p.total,
          deposit:     p.deposit,
        },
      });
      setSubmitted(true);
      navigate('/client/projects');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step label for progress bar ───────────────────────────────────────────
  const totalSteps = 5;
  const progressPct = step === 0 ? 0 : Math.round((step / (totalSteps - 1)) * 100);

  // ── Animation variants ────────────────────────────────────────────────────
  const variants = {
    enter:  (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <>
      <DashboardHeader title="Post a Project" />

      <div className="p-6 md:p-8 max-w-3xl mx-auto">

        {/* Progress bar + step labels */}
        {step > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              {STEP_LABELS.slice(1).map((label, i) => (
                <span
                  key={label}
                  style={{ color: i + 1 === step ? 'var(--accent)' : i + 1 < step ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: i + 1 > step ? 0.4 : 1 }}
                  className="hidden sm:block"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent)' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Step {step} of {totalSteps - 1}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {step === 0 && (
                <StepChoosePath onSelect={handleModeSelect} />
              )}

              {step === 1 && (
                <StepProjectDetails form={form} setForm={setForm} errors={errors} />
              )}

              {step === 2 && mode === 'service' && (
                <StepServiceSelection
                  selectedDept={selectedDept}
                  setSelectedDept={setSelectedDept}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                />
              )}

              {step === 2 && mode === 'open' && (
                <StepOpenBudget form={form} setForm={setForm} errors={errors} />
              )}

              {step === 3 && (
                <StepExtras
                  form={form}
                  setForm={setForm}
                  softwareSearch={softwareSearch}
                  setSoftwareSearch={setSoftwareSearch}
                  pricing={pricing}
                  errors={errors}
                />
              )}

              {step === 4 && (
                <StepReview
                  form={form}
                  mode={mode}
                  selectedService={selectedService}
                  pricing={pricing}
                  loading={loading}
                  error={error}
                  onSubmit={handleSubmit}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        {step > 0 && step < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Back button on review step */}
        {step === 4 && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} /> Back to Extras
            </button>
          </div>
        )}
      </div>
    </>
  );
}
