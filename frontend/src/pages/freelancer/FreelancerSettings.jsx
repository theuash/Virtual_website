import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/DashboardHeader";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, User, Mail, Phone, Calendar, Link, Clock,
  CheckCircle2, AlertCircle, Loader2, Trash2, Save, Sparkles,
} from "lucide-react";
import AvatarCircle, { resolveAvatar } from "../../components/AvatarCircle";

// ── Constants ─────────────────────────────────────────────────────
const HOURS_OPTIONS = [
  { value: "1-5",   label: "1–5 hrs / week" },
  { value: "5-10",  label: "5–10 hrs / week" },
  { value: "10-20", label: "10–20 hrs / week" },
  { value: "20-40", label: "20–40 hrs / week" },
  { value: "40+",   label: "40+ hrs / week" },
];
const CONTACT_TIMES = [
  "9am – 12pm", "12pm – 3pm", "3pm – 6pm", "6pm – 9pm", "Flexible / Anytime",
];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";
function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
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

// ── Main Component ────────────────────────────────────────────────
export default function FreelancerSettings() {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "", phone: "", dateOfBirth: "", portfolioUrl: "",
    hoursPerWeek: "", preferredContactTime: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null); // processed PNG blob
  const [bgRemoving, setBgRemoving]       = useState(false);
  const [saving, setSaving]               = useState(false);
  const [status, setStatus]               = useState(null);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  // Pre-fill from user — includes all signup + onboarding data
  useEffect(() => {
    if (!user) return;
    setForm({
      fullName:             user.fullName || "",
      // phone may come from signup (stored as user.phone)
      phone:                user.phone || "",
      // dateOfBirth from signup (stored as user.dateOfBirth or user.dob)
      dateOfBirth:          user.dateOfBirth
                              ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.slice(0, 10) : new Date(user.dateOfBirth).toISOString().slice(0, 10))
                              : "",
      portfolioUrl:         user.portfolioUrl || "",
      // hoursPerWeek from onboarding
      hoursPerWeek:         user.hoursPerWeek ? String(user.hoursPerWeek) : "",
      // preferredContactTime from onboarding
      preferredContactTime: user.preferredContactTime || "",
    });
    if (user.avatar) {
      setAvatarPreview(resolveAvatar(user.avatar));
    }
  }, [user]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Upload → try remove.bg if key exists, else use original directly
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Always set the original file immediately so Save works even if bg removal fails
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setStatus(null);

    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (!apiKey) return; // no key — just use original

    setBgRemoving(true);
    try {
      const fd = new FormData();
      fd.append("image_file", file);
      fd.append("size", "auto");

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: fd,
      });

      if (!res.ok) throw new Error(`remove.bg ${res.status}`);

      const blob = await res.blob();
      const pngFile = new File([blob], "avatar.png", { type: "image/png" });
      setAvatarFile(pngFile);
      setAvatarPreview(URL.createObjectURL(blob));
      setStatus({ type: "success", msg: "Background removed! Save to apply." });
      setTimeout(() => setStatus(null), 4000);
    } catch {
      // Keep original file — already set above
      setStatus({ type: "error", msg: "Background removal unavailable — original photo will be used." });
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setBgRemoving(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== "") fd.append(k, v); });
      if (avatarFile) {
        fd.append("avatar", avatarFile, avatarFile.name || "avatar.png");
        console.log("[settings] appending avatar:", avatarFile.name, avatarFile.size, "bytes", avatarFile.type);
      } else {
        console.log("[settings] no avatarFile to upload");
      }

      const res = await api.patch("/profile/update", fd);
      console.log("[settings] save response:", res.status, res.data?.data?.avatar);
      const updated = res.data?.data;
      if (updated) {
        // Preserve auth tokens — the profile update response doesn't include them
        const stored = JSON.parse(localStorage.getItem("virtual_user") || "{}");
        const merged = {
          ...stored,
          ...updated,
          token:        stored.token,
          refreshToken: stored.refreshToken,
        };
        localStorage.setItem("virtual_user", JSON.stringify(merged));
        setUser?.(merged);
        if (updated.avatar) {
          setAvatarPreview(resolveAvatar(updated.avatar));
        }
        setAvatarFile(null);
      }
      setStatus({ type: "success", msg: "Profile saved successfully." });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error("[settings] save error:", err?.response?.status, err?.response?.data, err?.message);
      setStatus({ type: "error", msg: err?.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      await api.delete("/profile/avatar");
      setAvatarPreview(null);
      setAvatarFile(null);
      const stored = JSON.parse(localStorage.getItem("virtual_user") || "{}");
      delete stored.avatar;
      localStorage.setItem("virtual_user", JSON.stringify(stored));
      setUser?.(prev => ({ ...prev, avatar: undefined }));
    } catch { /* silent */ }
    finally { setRemovingAvatar(false); }
  };

  const initial = (user?.fullName || "U").charAt(0).toUpperCase();

  return (
    <>
      <DashboardHeader title="Settings" />
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">

        {/* ── Avatar ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <User size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profile Picture</h2>
            </div>
            {/* Save button — top right of this section */}
            <button onClick={handleSave} disabled={saving || bgRemoving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--accent)", color: "#fff" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
          <div className="p-6 flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <AvatarCircle src={avatarPreview} initial={initial} size={96} />
              {bgRemoving && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} disabled={bgRemoving}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 disabled:opacity-50"
                style={{ background: "var(--accent)", borderColor: "var(--bg-secondary)", color: "#fff", zIndex: 10 }}>
                <Camera size={13} strokeWidth={2} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user?.fullName || "Your Name"}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles size={10} style={{ color: "var(--accent)" }} />
                <p className="text-[10px]" style={{ color: "var(--accent)" }}>Background auto-removed via AI</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => fileRef.current?.click()} disabled={bgRemoving}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--bg-card)" }}>
                  {bgRemoving ? "Processing…" : "Upload Photo"}
                </button>
                {avatarPreview && (
                  <button onClick={handleRemoveAvatar} disabled={removingAvatar}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-[1.02] flex items-center gap-1 disabled:opacity-50"
                    style={{ borderColor: "#ef444444", color: "#ef4444", background: "transparent" }}>
                    {removingAvatar ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>JPG, PNG, WebP · Max 5MB</p>
            </div>
          </div>
        </div>

        {/* ── Personal Info ───────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <User size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" icon={User}>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                className={inputCls} style={inputStyle} placeholder="Your full name" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input value={user?.email || ""} disabled
                className={inputCls} style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input name="phone" value={form.phone} onChange={handleChange}
                className={inputCls} style={inputStyle} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Date of Birth" icon={Calendar}>
              <DOBPicker value={form.dateOfBirth} onChange={val => setForm(f => ({ ...f, dateOfBirth: val }))} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Portfolio URL" icon={Link}>
                <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange}
                  className={inputCls} style={inputStyle} placeholder="https://yourportfolio.com" />
              </Field>
            </div>

            {/* Skills — read-only, set during onboarding */}
            {user?.primarySkill && (
              <div className="sm:col-span-2">
                <Field label="Skills">
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: "var(--accent)", color: "#fff" }}>
                      {user.primarySkill.replace(/_/g, " ")} · Primary
                    </span>
                    {(user.secondarySkills || []).map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                    <span className="text-[10px] self-center" style={{ color: "var(--text-secondary)" }}>
                      · Change via onboarding
                    </span>
                  </div>
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* ── Work Preferences ────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <Clock size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Work Preferences</h2>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Hours per Week" icon={Clock}>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setForm(f => ({ ...f, hoursPerWeek: opt.value }))}
                    className="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      background: form.hoursPerWeek === opt.value ? "var(--accent)" : "var(--bg-card)",
                      borderColor: form.hoursPerWeek === opt.value ? "var(--accent)" : "var(--border)",
                      color: form.hoursPerWeek === opt.value ? "#fff" : "var(--text-secondary)",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Preferred Contact Time" icon={Clock}>
              <div className="flex flex-wrap gap-2">
                {CONTACT_TIMES.map(t => (
                  <button key={t}
                    onClick={() => setForm(f => ({ ...f, preferredContactTime: t }))}
                    className="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      background: form.preferredContactTime === t ? "var(--accent)" : "var(--bg-card)",
                      borderColor: form.preferredContactTime === t ? "var(--accent)" : "var(--border)",
                      color: form.preferredContactTime === t ? "#fff" : "var(--text-secondary)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Account Status ──────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Account Status</h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tier",         value: user?.tier || "—" },
              { label: "Role",         value: user?.role || "—" },
              { label: "Verified",     value: user?.isVerified ? "Yes" : "No" },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—" },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "var(--bg-card)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                <p className="text-sm font-bold capitalize" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Status toast ────────────────────────────────────────── */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: status.type === "success" ? "#10b98122" : "#ef444422",
                color: status.type === "success" ? "#10b981" : "#ef4444",
                border: `1px solid ${status.type === "success" ? "#10b98144" : "#ef444444"}`,
              }}>
              {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
