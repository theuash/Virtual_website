import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, ArrowRight, ChevronLeft, ArrowLeft, Clock, Zap, Star, Shield, Tag, CheckCircle } from "lucide-react";
import Header from "../../components/landing/Header";
import { getAllPricing } from "../../services/pricing";
import { useCurrency } from "../../context/CurrencyContext";

const DISCOUNT = 0.15;
const FPS_DEPTS = new Set(['3d_animation', 'cgi']);

const FPS_OPTIONS = [
  { label: '24 fps', value: 24, multiplier: 1.0, note: 'Base' },
  { label: '30 fps', value: 30, multiplier: 1.4, note: '+40%' },
  { label: '60 fps', value: 60, multiplier: 2.4, note: '+140%' },
  { label: '120 fps', value: 120, multiplier: 3.4, note: '+240%' },
];

const TABS = [
  { key: "video_editing", label: "Video Editing" },
  { key: "graphic_designing", label: "Graphic Design" },
  { key: "3d_animation", label: "3D Animation" },
  { key: "cgi", label: "CGI / VFX" },
  { key: "script_writing", label: "Script Writing" },
];




const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Service content definitions (rich info per service type) ────────────────
const SERVICE_INFO = {
  // Video Editing
  "Documentary": {
    icon: "🎬", tags: ["Storytelling","Long-form","Color Grading","Sound Mix"],
    about: "Documentary editing weaves real-world footage into a compelling narrative. Our editors shape raw material into powerful stories with precise pacing, archival cuts, and immersive sound design.",
    includes: ["Multi-cam sync","Color correction & grading","Dialogue cleanup","Music & SFX bed","Chapter markers","Subtitle export"],
    turnaround: "5–10 days per hour of footage",
  },
  "YouTube Video": {
    icon: "▶️", tags: ["Engagement","Retention","B-roll","Thumbnails"],
    about: "YouTube edits are engineered for watch-time. We handle jump cuts, B-roll layering, motion graphics, and hook structures that keep viewers glued.",
    includes: ["Jump-cut pacing","B-roll sourcing","Lower thirds & titles","Background music","Outro & end-screen","Thumbnail composition"],
    turnaround: "2–4 days per video",
  },
  "Short-form / Reels": {
    icon: "📱", tags: ["Viral","Hook","Trending Audio","9:16"],
    about: "Optimised for vertical feeds. Every second counts — we engineer hooks in the first 3 frames and drive maximum shares.",
    includes: ["Vertical crop (9:16)","Trending audio sync","Text overlays","Transition effects","Caption generation","Platform export presets"],
    turnaround: "1–2 days per clip",
  },
  "Cinematic Film": {
    icon: "🎥", tags: ["Color Science","LUT Grading","Anamorphic","Grade"],
    about: "Feature-level cinematic treatment for brand films, commercials, and narrative shorts. Lush grades, precise sound design, and film-emulation finishing.",
    includes: ["Primary & secondary grading","Custom LUT creation","Anamorphic lens simulation","Film grain & texture","Stereo sound mix","DCP / broadcast master"],
    turnaround: "7–14 days per project",
  },
  // Graphic Design
  "Logo Design": {
    icon: "✏️", tags: ["Brand Identity","Vector","SVG","Versatile"],
    about: "A logo is the cornerstone of your brand. We craft scalable, timeless marks that work across every medium — from a business card to a billboard.",
    includes: ["3 initial concepts","Unlimited revisions","Vector files (AI, SVG, EPS)","PNG / PDF export","Brand color palette","Usage guidelines"],
    turnaround: "3–5 days",
  },
  "Social Media Graphics": {
    icon: "📊", tags: ["Templates","Brand Kit","Canva","Figma"],
    about: "Scroll-stopping visuals for every platform. We build cohesive template systems so your brand looks consistent from Instagram to LinkedIn.",
    includes: ["Post & story templates","Brand-consistent palette","Editable source files","Platform-size variants","Caption-ready layouts"],
    turnaround: "1–3 days per batch",
  },
  // 3D Animation
  "Product Visualization": {
    icon: "📦", tags: ["3D","Photorealistic","Render","E-commerce"],
    about: "Photorealistic 3D renders that sell products before they even exist. Perfect for e-commerce, Kickstarter campaigns, and product launches.",
    includes: ["High-poly 3D modelling","Material & texture mapping","Studio lighting setup","360° turntable render","Transparent background PNG","4K resolution output"],
    turnaround: "5–10 days per product",
  },
  "Character Animation": {
    icon: "🤸", tags: ["Rigging","Motion Capture","Lip Sync","FBX"],
    about: "Bring characters to life with fluid, expressive animation. From idle loops to full cinematic sequences, we handle every frame.",
    includes: ["Character rigging","Keyframe animation","Lip sync","Emotion blendshapes","FBX / GLTF export","Render-ready output"],
    turnaround: "7–14 days per scene",
  },
  // CGI / VFX
  "Green Screen Removal": {
    icon: "🟩", tags: ["Chroma Key","Matte","Compositing","Nuke"],
    about: "Frame-perfect chroma keying with edge refinement, hair detail preservation, and seamless background compositing.",
    includes: ["Chroma key extraction","Edge & hair refinement","Background plate integration","Colour match","Motion blur restoration","Delivery in ProRes / H.264"],
    turnaround: "2–5 days per clip",
  },
  "VFX Compositing": {
    icon: "💥", tags: ["Nuke","After Effects","Tracking","Particles"],
    about: "Hollywood-grade compositing for live-action + CG integration. Match-moving, lighting integration, and photorealistic particle effects.",
    includes: ["Camera match-move","3D element integration","Particle & simulation FX","Colour integration","Lens distortion match","Grain & noise match"],
    turnaround: "5–14 days per shot",
  },
  // Script Writing
  "Video Script": {
    icon: "📝", tags: ["Hook","CTA","Tone","SEO"],
    about: "Data-driven scripts engineered for retention. Every line earns its place — from the 3-second hook to the CTA that converts.",
    includes: ["Research & brief","Hook & opening","Full scene-by-scene script","B-roll note cues","On-screen text suggestions","2 revision rounds"],
    turnaround: "2–4 days",
  },
  "Documentary Script": {
    icon: "📖", tags: ["Narrative","Interview","Archive","Long-form"],
    about: "Story-first documentary writing. We structure interviews, archival material, and narration into a powerful three-act arc.",
    includes: ["Story arc development","Interview question guide","VO narration script","Archive source notes","Pacing & beat sheet","Full production draft"],
    turnaround: "5–10 days",
  },
};

// Generic fallback info builder
function getServiceInfo(item, deptName) {
  const known = SERVICE_INFO[item.name];
  if (known) return known;
  return {
    icon: "⚡",
    tags: item.tags || [deptName],
    about: `${item.name} is a professional service offered under our ${deptName} department. Our experts deliver precise, high-quality results tailored to your project's unique requirements.`,
    includes: [
      "Professional execution",
      `Billed per ${item.unit}`,
      item.tolerance ? `Tolerance: ${item.tolerance}` : "Precise delivery",
      "Source files included",
      "Revision support",
      "Fast turnaround",
    ].filter(Boolean),
    turnaround: "Varies by project scope",
  };
}

// ─── Service Drawer ──────────────────────────────────────────────────────────
function ServiceDrawer({ service, deptName, onClose }) {
  const navigate = useNavigate();
  const { convert } = useCurrency();
  if (!service) return null;

  const info = getServiceInfo(service, deptName);
  const convertedNormal = convert(service.rate);
  const discountedValue = parseFloat((convertedNormal.value * 0.85).toFixed(2));

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[150]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer panel */}
      <motion.div
        key="drawer-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 38, mass: 0.9 }}
        className="fixed right-0 top-0 bottom-0 z-[160] flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.icon}</span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-0.5" style={{ color: "var(--text-secondary)" }}>
                {deptName}
              </div>
              <h2 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                {service.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border transition-all hover:bg-white/5 shrink-0 mt-0.5"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* Pricing block */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50" style={{ color: "var(--text-secondary)" }}>Pricing</div>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <div className="text-[11px] line-through opacity-40 mb-0.5" style={{ color: "var(--text-secondary)" }}>
                  {convertedNormal.symbol}{convertedNormal.value.toFixed(2)} / {service.unit}
                </div>
                <div className="text-4xl font-black tracking-tight" style={{ color: "var(--accent)" }}>
                  {convertedNormal.symbol}{discountedValue.toFixed(2)}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>per {service.unit} · first project 15% off</div>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full mb-1"
                style={{ background: "rgba(var(--accent-rgb),0.12)", color: "var(--accent)" }}
              >
                <Sparkles size={10} className="inline mr-1" />15% off
              </span>
            </div>
            {service.tolerance && (
              <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                <Shield size={12} style={{ color: "var(--accent)", opacity: 0.7 }} />
                Tolerance: {service.tolerance}
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50" style={{ color: "var(--text-secondary)" }}>About this service</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {info.about}
            </p>
          </div>

          {/* Tags */}
          {info.tags?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50" style={{ color: "var(--text-secondary)" }}>Keywords</div>
              <div className="flex flex-wrap gap-2">
                {info.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-primary)" }}>
                    <Tag size={9} />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What's included */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50" style={{ color: "var(--text-secondary)" }}>What's included</div>
            <ul className="space-y-2.5">
              {info.includes.map(inc => (
                <li key={inc} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                  {inc}
                </li>
              ))}
            </ul>
          </div>

          {/* Turnaround */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: "rgba(var(--accent-rgb),0.04)", borderColor: "rgba(var(--accent-rgb),0.15)" }}
          >
            <Clock size={15} style={{ color: "var(--accent)" }} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5" style={{ color: "var(--text-secondary)" }}>Typical turnaround</div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{info.turnaround}</div>
            </div>
          </div>

          {/* Popular badge */}
          {service.isPopular && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl border"
              style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.25)" }}
            >
              <Star size={14} style={{ color: "#f59e0b" }} />
              <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>This is one of our most popular formats</span>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-5 border-t" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <button
            onClick={() => navigate("/signup?role=client&redirect=/client/post-project")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Zap size={15} /> Post a Project · {convertedNormal.symbol}{discountedValue.toFixed(2)}/{service.unit}
          </button>
          <p className="text-center text-[10px] mt-2 opacity-50" style={{ color: "var(--text-secondary)" }}>
            First project 15% off · No commitment required
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── FPS Selector ──────────────────────────────────────────────────────────
function FpsSelector({ selected, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 p-4 rounded-2xl border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs font-bold uppercase tracking-widest shrink-0" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
          Frame Rate
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {FPS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selected.value === opt.value ? "var(--accent)" : "var(--bg-secondary)",
                color: selected.value === opt.value ? "#fff" : "var(--text-secondary)",
                border: `1.5px solid ${selected.value === opt.value ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


function ServiceBox({ item, index, showDiscount, deptName, onSelect, fpsMultiplier = 1 }) {
  const { convert } = useCurrency();
  const adjustedRate = item.rate * fpsMultiplier;
  const convertedNormal = convert(adjustedRate);
  // Apply exact 15% off the converted (psycho-priced) value
  const discountedValue = parseFloat((convertedNormal.value * (1 - DISCOUNT)).toFixed(2));
  const convertedDiscounted = {
    symbol: convertedNormal.symbol,
    value: discountedValue,
    display: convertedNormal.symbol + discountedValue.toFixed(2),
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      onClick={() => onSelect && onSelect(item)}
      className="group relative overflow-hidden rounded-xl border transition-all duration-300 p-5 cursor-pointer"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      whileHover={{ y: -3, borderColor: "var(--accent)", boxShadow: "0 12px 24px rgba(var(--accent-rgb), 0.1)" }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity pointer-events-none"
        style={{ background: "linear-gradient(135deg, var(--accent), transparent)" }} />
      <div className="relative z-10">
        <div className="text-sm font-semibold mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
          {item.name}
        </div>
        {item.tolerance && (
          <div className="text-[10px] mb-3 opacity-50" style={{ color: "var(--text-secondary)" }}>
            {item.tolerance}
          </div>
        )}
        <div className="flex items-baseline gap-1.5">
          {showDiscount ? (
            <div>
              <div className="text-xs line-through opacity-40" style={{ color: "var(--text-secondary)" }}>
                {convertedNormal.symbol}{convertedNormal.value.toFixed(2)}
              </div>
              <div className="text-2xl font-black" style={{ color: "var(--accent)" }}>
                {convertedDiscounted.symbol}{convertedDiscounted.value.toFixed(2)}
              </div>
              <div className="text-[9px] mt-1 flex items-center gap-1" style={{ color: "var(--accent)", opacity: 0.7 }}>
                <Sparkles size={8} /> 15% off
              </div>
            </div>
          ) : (
            <div className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              {convertedNormal.symbol}{convertedNormal.value.toFixed(2)}
            </div>
          )}
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--text-secondary)" }}>
            /{item.unit}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [query, setQuery] = useState("");
  const [showDiscount, setShowDiscount] = useState(true);
  const [selectedService, setSelectedService] = useState(null);  // { item, deptName }
  const [selectedFps, setSelectedFps] = useState(FPS_OPTIONS[0]); // default 24fps
  const sectionRefs = useRef({});

  const openDrawer = (item, deptName) => setSelectedService({ item, deptName });
  const closeDrawer = () => setSelectedService(null);
  const fpsMultiplier = selectedFps.multiplier;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    getAllPricing()
      .then(res => setAllData(res.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash && TABS.find(t => t.key === hash)) {
      setActiveTab(hash);
      setTimeout(() => {
        const el = sectionRefs.current[hash];
        if (el) {
          const headerH = window.innerWidth < 768 ? 56 : 80;
          const top = el.getBoundingClientRect().top + window.scrollY - headerH - 8;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 300);
    }
  }, [location.hash, loading]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results = [];
    for (const dept of allData) {
      const all = [...(dept.generalServices || []), ...(dept.popularFormats || [])];
      for (const item of all) {
        if (item.name.toLowerCase().includes(q)) {
          results.push({ ...item, deptName: dept.displayName, department: dept.department });
        }
      }
    }
    return results;
  }, [query, allData]);

  const handleTabClick = (key) => {
    setActiveTab(key);
    setQuery("");
    // Reset FPS to 24fps when leaving or entering FPS-enabled tabs
    setSelectedFps(FPS_OPTIONS[0]);
    setTimeout(() => {
      const el = sectionRefs.current[key];
      if (el) {
        const headerH = window.innerWidth < 768 ? 56 : 80;
        // +48 accounts for the sticky tabs bar height (~48px)
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 48 - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Header />

      {/* Service Detail Drawer */}
      <AnimatePresence>
        {selectedService && (
          <ServiceDrawer
            service={selectedService.item}
            deptName={selectedService.deptName}
            onClose={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </motion.button>



      {/* Mobile: fixed bg block that covers the gap between header and sticky tabs */}
      <div
        className="fixed sm:hidden z-40"
        style={{
          top: 2,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--bg-primary)",
        }}
      />

      {/* Desktop view with floating border */}
      <div className="hidden sm:block pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto rounded-2xl border p-8" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <div className="space-y-8">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate("/")}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            {/* Hero */}
            <section className="pt-36 pb-16 text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: "var(--accent)", opacity: 0.05 }} />
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button onClick={() => navigate("/")}
                    className="p-2 rounded-lg border transition-all hover:bg-white/5"
                    style={{ borderColor: "var(--border)" }}>
                    <ChevronLeft size={18} style={{ color: "var(--text-secondary)" }} />
                  </button>
                  <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full"
                    style={{ color: "var(--accent)", borderColor: "rgba(var(--accent-rgb), 0.2)", background: "rgba(var(--accent-rgb), 0.05)" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
                    Pricing
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4" style={{ color: "var(--text-primary)" }}>
                  Per-unit. No surprises.
                </h1>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Every service is priced per unit of work. You pay for exactly what you get.
                </p>
              </motion.div>
            </section>

            {/* Discount banner */}
            <div className="px-6 mb-8">
              <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 rounded-xl border"
                  style={{ background: "rgba(var(--accent-rgb), 0.04)", borderColor: "rgba(var(--accent-rgb), 0.15)" }}>
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} style={{ color: "var(--accent)" }} />
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>First project? 15% off.</span>
                      <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>Applied automatically at checkout.</span>
                    </div>
                  </div>
                  <button onClick={() => setShowDiscount(v => !v)}
                    className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70 shrink-0"
                    style={{ color: "var(--accent)" }}>
                    {showDiscount ? "Hide discount" : "Show discount"}
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Search */}
            <div className="px-6 mb-6 relative z-[70]">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <Search size={16} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search any service..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--text-primary)" }} />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X size={14} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search results */}
            <AnimatePresence>
              {query.trim() && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="px-6 mb-10">
                  <div className="max-w-5xl mx-auto">
                    {searchResults.length === 0 ? (
                      <p className="text-sm py-6 text-center" style={{ color: "var(--text-secondary)" }}>No services found for "{query}"</p>
                    ) : (
                      <>
                        <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50" style={{ color: "var(--text-secondary)" }}>
                          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {searchResults.map((item, i) => (
                            <ServiceBox key={`${item.department}-${item.name}`} item={item} index={i} showDiscount={showDiscount} deptName={item.deptName} onSelect={(s) => openDrawer(s, item.deptName)} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sticky tabs */}
            {!query.trim() && (
              <div className="sticky top-14 sm:top-[79px] z-50 px-8 py-6 border-b"
                style={{
                  background: "var(--bg-primary)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderColor: "var(--border)",
                  boxShadow: "0 -90px 0 0 var(--bg-primary)",
                }}>
                <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {TABS.map(tab => (
                    <button key={tab.key} onClick={() => handleTabClick(tab.key)}
                      className="relative px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg whitespace-nowrap transition-all"
                      style={{
                        color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-secondary)",
                        background: activeTab === tab.key ? "var(--bg-secondary)" : "transparent",
                        opacity: activeTab === tab.key ? 1 : 0.5,
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Department sections */}
            {!query.trim() && (
              <div className="px-6 pb-32">
                <div className="max-w-5xl mx-auto">
                  {loading ? (
                    <div className="py-32 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Loading pricing...</div>
                  ) : (
                    TABS.map(tab => {
                      const dept = allData.find(d => d.department === tab.key);
                      if (!dept) return null;
                      return (
                        <div key={tab.key} ref={el => sectionRefs.current[tab.key] = el} id={tab.key}
                          className="pt-8 sm:pt-16 pb-8" style={{ display: activeTab === tab.key ? "block" : "none" }}>
                          <div className="mb-10">
                            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>Department</div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                              {dept.displayName}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              Starting from <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                {convert(dept.startingFrom).symbol}{convert(dept.startingFrom).value}/{dept.startingUnit}
                              </span>
                            </p>
                          </div>
                          {/* FPS Selector - only for 3D/CGI */}
                          {FPS_DEPTS.has(tab.key) && (
                            <FpsSelector selected={selectedFps} onChange={setSelectedFps} />
                          )}
                          {dept.popularFormats?.length > 0 && (
                            <div className="mb-12">
                              <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-5" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>Popular Formats</div>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dept.popularFormats.map((item, i) => (
                                  <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} deptName={dept.displayName} onSelect={(s) => openDrawer(s, dept.displayName)} fpsMultiplier={FPS_DEPTS.has(tab.key) ? fpsMultiplier : 1} />
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                              {dept.popularFormats?.length > 0 ? "Generalized Services" : "All Services"}
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {dept.generalServices.map((item, i) => (
                                <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} deptName={dept.displayName} onSelect={(s) => openDrawer(s, dept.displayName)} fpsMultiplier={FPS_DEPTS.has(tab.key) ? fpsMultiplier : 1} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <section className="py-24 px-6 border-t text-center relative overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: "var(--accent)", opacity: 0.05 }} />
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="max-w-xl mx-auto relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4" style={{ color: "var(--text-primary)" }}>
                  Ready to post your project?
                </h2>
                <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
                  Your first project gets 15% off.
                </p>
                <button onClick={() => navigate("/signup?role=client&redirect=/client/post-project")}
                  className="btn-primary py-3.5 px-8 text-sm font-bold tracking-wide flex items-center gap-2 mx-auto">
                  Get Started <ArrowRight size={16} />
                </button>
              </motion.div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile view without floating border */}
      <div className="sm:hidden">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', marginTop: '2rem', marginLeft: '2rem' }}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Hero */}
        <section className="pt-44 pb-16 px-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: "var(--accent)", opacity: 0.05 }} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <button onClick={() => navigate("/")}
                className="p-2 rounded-lg border transition-all hover:bg-white/5"
                style={{ borderColor: "var(--border)" }}>
                <ChevronLeft size={18} style={{ color: "var(--text-secondary)" }} />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full"
                style={{ color: "var(--accent)", borderColor: "rgba(var(--accent-rgb), 0.2)", background: "rgba(var(--accent-rgb), 0.05)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
                Pricing
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4" style={{ color: "var(--text-primary)" }}>
              Per-unit. No surprises.
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Every service is priced per unit of work. You pay for exactly what you get.
            </p>
          </motion.div>
        </section>

        {/* Discount banner */}
        <div className="px-6 mb-8">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 rounded-xl border"
              style={{ background: "rgba(var(--accent-rgb), 0.04)", borderColor: "rgba(var(--accent-rgb), 0.15)" }}>
              <div className="flex items-center gap-3">
                <Sparkles size={16} style={{ color: "var(--accent)" }} />
                <div>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>First project? 15% off.</span>
                  <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>Applied automatically at checkout.</span>
                </div>
              </div>
              <button onClick={() => setShowDiscount(v => !v)}
                className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70 shrink-0"
                style={{ color: "var(--accent)" }}>
                {showDiscount ? "Hide discount" : "Show discount"}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-6 relative z-[70]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
              <Search size={16} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search any service..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-primary)" }} />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={14} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search results */}
        <AnimatePresence>
          {query.trim() && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="px-6 mb-10">
              <div className="max-w-5xl mx-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: "var(--text-secondary)" }}>No services found for "{query}"</p>
                ) : (
                  <>
                    <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50" style={{ color: "var(--text-secondary)" }}>
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.map((item, i) => (
                        <ServiceBox key={`${item.department}-${item.name}`} item={item} index={i} showDiscount={showDiscount} deptName={item.deptName} onSelect={(s) => openDrawer(s, item.deptName)} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky tabs */}
        {!query.trim() && (
          <div className="sticky top-14 sm:top-[79px] z-50 px-6 py-3 border-b"
            style={{
              background: "var(--bg-primary)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: "var(--border)",
              boxShadow: "0 -56px 0 0 var(--bg-primary)",
            }}>
            <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => handleTabClick(tab.key)}
                  className="relative px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg whitespace-nowrap transition-all"
                  style={{
                    color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-secondary)",
                    background: activeTab === tab.key ? "var(--bg-secondary)" : "transparent",
                    opacity: activeTab === tab.key ? 1 : 0.5,
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Department sections */}
        {!query.trim() && (
          <div className="px-6 pb-32">
            <div className="max-w-5xl mx-auto">
              {loading ? (
                <div className="py-32 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Loading pricing...</div>
              ) : (
                TABS.map(tab => {
                  const dept = allData.find(d => d.department === tab.key);
                  if (!dept) return null;
                  return (
                    <div key={tab.key} ref={el => sectionRefs.current[tab.key] = el} id={tab.key}
                      className="pt-8 sm:pt-16 pb-8" style={{ display: activeTab === tab.key ? "block" : "none" }}>
                      <div className="mb-10">
                        <div className="text-xs font-bold uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>Department</div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                          {dept.displayName}
                        </h2>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Starting from <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {convert(dept.startingFrom).symbol}{convert(dept.startingFrom).value}/{dept.startingUnit}
                          </span>
                        </p>
                      </div>
                      {/* FPS Selector - only for 3D/CGI */}
                      {FPS_DEPTS.has(tab.key) && (
                        <FpsSelector selected={selectedFps} onChange={setSelectedFps} />
                      )}
                      {dept.popularFormats?.length > 0 && (
                        <div className="mb-12">
                          <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-5" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>Popular Formats</div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dept.popularFormats.map((item, i) => (
                              <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} deptName={dept.displayName} onSelect={(s) => openDrawer(s, dept.displayName)} fpsMultiplier={FPS_DEPTS.has(tab.key) ? fpsMultiplier : 1} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                          {dept.popularFormats?.length > 0 ? "Generalized Services" : "All Services"}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dept.generalServices.map((item, i) => (
                            <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} deptName={dept.displayName} onSelect={(s) => openDrawer(s, dept.displayName)} fpsMultiplier={FPS_DEPTS.has(tab.key) ? fpsMultiplier : 1} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <section className="py-24 px-6 border-t text-center relative overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: "var(--accent)", opacity: 0.05 }} />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4" style={{ color: "var(--text-primary)" }}>
              Ready to post your project?
            </h2>
            <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
              Your first project gets 15% off.
            </p>
            <button onClick={() => navigate("/signup?role=client&redirect=/client/post-project")}
              className="btn-primary py-3.5 px-8 text-sm font-bold tracking-wide flex items-center gap-2 mx-auto">
              Get Started <ArrowRight size={16} />
            </button>
          </motion.div>
        </section>
      </div>
    </div>
  );
}





