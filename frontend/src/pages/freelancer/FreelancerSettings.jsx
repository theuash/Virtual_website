import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DashboardHeader from "../../components/layout/DashboardHeader";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropModal from "../../components/ui/ImageCropModal";
import {
  Camera, User, Mail, Phone, Calendar, Link, Clock,
  CheckCircle2, AlertCircle, Loader2, Trash2, Save, Sparkles,
  Shield, Bell, Moon, Sun, Globe
} from "lucide-react";
import { COUNTRIES } from "../../components/common/CountrySelector";
import { useCurrency } from "../../context/CurrencyContext";
import AvatarCircle, { resolveAvatar } from "../../components/common/AvatarCircle";
import { toast } from "react-hot-toast";
import { requestNotificationPermission } from "../../services/notificationService";

// -- Constants -----------------------------------------------------
const HOURS_OPTIONS = [
  { value: 5,  label: "1-5 hrs / week" },
  { value: 10, label: "5-10 hrs / week" },
  { value: 20, label: "10-20 hrs / week" },
  { value: 40, label: "20-40 hrs / week" },
];
const CONTACT_TIMES = [
  "9am - 12pm", "12pm - 3pm", "3pm - 6pm", "6pm - 9pm", "Flexible / Anytime",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
        style={{ color: "var(--text-secondary)" }}>
        {Icon && <Icon size={11} strokeWidth={2} />}
        {label}
      </label>
      {children}
    </div>
  );
}

function DOBPicker({ value, onChange }) {
  const parsed = value ? new Date(value) : null;
  const [day,   setDay]   = useState(parsed ? parsed.getDate() : "");
  const [month, setMonth] = useState(parsed ? parsed.getMonth() + 1 : "");
  const [year,  setYear]  = useState(parsed ? parsed.getFullYear() : "");
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);
  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  useEffect(() => {
    if (day && month && year) {
      const d = String(day).padStart(2, "0");
      const m = String(month).padStart(2, "0");
      onChange(`${year}-${m}-${d}`);
    }
  }, [day, month, year]);
  const sel = {
    background: "var(--bg-card)", border: "1px solid var(--border)",
    color: "var(--text-primary)", borderRadius: "0.75rem",
    padding: "0.75rem 1rem", fontSize: "0.875rem", outline: "none", width: "100%",
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={day}   onChange={e => setDay(Number(e.target.value))}   style={sel}>
        <option value="">Day</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={month} onChange={e => setMonth(Number(e.target.value))} style={sel}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select value={year}  onChange={e => setYear(Number(e.target.value))}  style={sel}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all";
const inputStyle = { background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" };

export default function FreelancerSettings() {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setIsIndia } = useCurrency();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');

  const [form, setForm] = useState({
    fullName: "", phone: "", dateOfBirth: "", portfolioUrl: "",
    hoursPerWeek: "", country: "",
  });
  const [contactDays, setContactDays] = useState([]);
  const [contactTime, setContactTime] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [bgRemoving, setBgRemoving]       = useState(false);
  const [saving, setSaving]               = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [cropSrc, setCropSrc]             = useState(null);

  useEffect(() => {
    if (!user) return;
    let parsedDays = [];
    let parsedTime = "";
    if (user.preferredContactTime) {
      const parts = user.preferredContactTime.split('  ');
      if (parts.length === 2) {
        parsedDays = parts[0].split(', ').map(d => d.trim()).filter(Boolean);
        parsedTime = parts[1].trim();
      } else parsedTime = user.preferredContactTime;
    }

    setForm({
      fullName:     user.fullName || "",
      phone:        user.phone || "",
      dateOfBirth:  user.dateOfBirth
                      ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.slice(0, 10) : new Date(user.dateOfBirth).toISOString().slice(0, 10))
                      : "",
      portfolioUrl: user.portfolioUrl || "",
      hoursPerWeek: user.hoursPerWeek ? Number(user.hoursPerWeek) : "",
      country:      user.country || "IN",
    });
    setContactDays(parsedDays);
    setContactTime(parsedTime);
    if (user.avatar) setAvatarPreview(resolveAvatar(user.avatar));
  }, [user]);

  const handlePushToggle = async () => {
    if (pushEnabled) {
      toast.error('Browser push permissions must be revoked in site settings.');
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Permission denied or dismissed.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== "") fd.append(k, v); });
      if (contactDays.length > 0 || contactTime) {
        const combined = contactDays.length > 0 && contactTime
          ? `${contactDays.join(', ')}  ${contactTime}`
          : contactTime || contactDays.join(', ');
        fd.append("preferredContactTime", combined);
      }
      if (avatarFile) fd.append("avatar", avatarFile, avatarFile.name || "avatar.png");
      
      const res = await api.patch("/profile/update", fd);
      const updated = res.data?.data;
      if (updated) {
        const stored = JSON.parse(localStorage.getItem("virtual_user") || "{}");
        const merged = { ...stored, ...updated, token: stored.token, refreshToken: stored.refreshToken };
        localStorage.setItem("virtual_user", JSON.stringify(merged));
        setUser?.(merged);
        if (updated.country) setIsIndia(updated.country === "IN");
        toast.success("Profile saved successfully.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCropDone = useCallback(async (croppedFile, previewUrl) => {
    setCropSrc(null);
    setAvatarFile(croppedFile);
    setAvatarPreview(previewUrl);
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (!apiKey) return;

    setBgRemoving(true);
    try {
      const fd = new FormData();
      fd.append("image_file", croppedFile);
      const res = await fetch("https://api.remove.bg/v1.0/removebg", { method: "POST", headers: { "X-Api-Key": apiKey }, body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const pngFile = new File([blob], "avatar.png", { type: "image/png" });
      setAvatarFile(pngFile);
      setAvatarPreview(URL.createObjectURL(blob));
    } catch { /* silent fallback */ }
    finally { setBgRemoving(false); }
  }, []);

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'app',      label: 'System',   icon: <SettingsIcon size={16} /> },
  ];

  const initial = (user?.fullName || "U").charAt(0).toUpperCase();

  return (
    <>
      {cropSrc && <ImageCropModal imageSrc={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />}
      <DashboardHeader title="Freelancer Settings" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:bg-white/5 opacity-60'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
             <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {/* Avatar Card */}
                    <div className="p-8 rounded-3xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                          <AvatarCircle src={avatarPreview} initial={initial} size={120} />
                          <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-accent shadow-lg text-white"><Camera size={13} /></button>
                          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) { const r = new FileReader(); r.onload = () => setCropSrc(r.result); r.readAsDataURL(file); }
                          }} />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                          <h3 className="text-base font-black">{user?.fullName}</h3>
                          <p className="text-xs opacity-50 mb-4">{user?.email}</p>
                          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest transition-all">
                             {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-5" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                        <Field label="Full Name" icon={User}><input name="fullName" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className={inputCls} style={inputStyle} /></Field>
                        <Field label="Phone" icon={Phone}><input name="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className={inputCls} style={inputStyle} /></Field>
                        <Field label="Date of Birth" icon={Calendar}><DOBPicker value={form.dateOfBirth} onChange={v => setForm({...form, dateOfBirth: v})} /></Field>
                        <Field label="Portfolio URL" icon={Link}><input name="portfolioUrl" value={form.portfolioUrl} onChange={(e) => setForm({...form, portfolioUrl: e.target.value})} className={inputCls} style={inputStyle} /></Field>
                        <Field label="Country" icon={Globe}>
                          <select name="country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className={inputCls} style={inputStyle}>
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                          </select>
                        </Field>
                    </div>

                    <div className="p-8 rounded-3xl border space-y-6" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-40">Work Preferences</h4>
                        <Field label="Hours per Week"><div className="flex flex-wrap gap-2">{HOURS_OPTIONS.map(o => <button key={o.value} onClick={() => setForm({...form, hoursPerWeek: o.value})} className={`px-4 py-2 rounded-full text-xs font-bold border ${form.hoursPerWeek === o.value ? 'bg-accent text-white' : 'opacity-40'}`}>{o.label}</button>)}</div></Field>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'app' && (
                   <motion.div key="app" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                       <h2 className="text-xl font-black mb-8">System Preferences</h2>
                       <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                  {isDark ? <Moon size={18} /> : <Sun size={18} />}
                               </div>
                               <div><h3 className="text-sm font-black">Interface Theme</h3><p className="text-[10px] opacity-40">Cinematic Dark or Clean Light.</p></div>
                            </div>
                            <button onClick={toggleTheme} className="w-14 h-8 rounded-full bg-accent/20 relative p-1"><div className={`w-6 h-6 rounded-full bg-accent transition-all ${isDark ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                         </div>

                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Bell size={18} /></div>
                               <div><h3 className="text-sm font-black">Browser Notifications</h3><p className="text-[10px] opacity-40">Get alerts for new task approvals and payments.</p></div>
                            </div>
                            <button onClick={handlePushToggle} className={`w-14 h-8 rounded-full relative p-1 transition-all ${pushEnabled ? 'bg-accent' : 'bg-accent/20'}`}><div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsIcon({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
