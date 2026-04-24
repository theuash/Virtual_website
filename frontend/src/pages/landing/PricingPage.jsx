import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, ArrowRight, ChevronLeft, CheckCircle2, Info, PlayCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import { getAllPricing } from '../../services/pricing';
import { useCurrency } from '../../context/CurrencyContext';

const DISCOUNT = 0.15;
const TABS = [
  { key: 'video_editing',     label: 'Video Editing' },
  { key: 'graphic_designing', label: 'Graphic Design' },
  { key: '3d_animation',      label: '3D Animation' },
  { key: 'cgi',               label: 'CGI / VFX' },
  { key: 'script_writing',    label: 'Script Writing' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] },
  }),
};

// â”€â”€ Rich metadata for each service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ── Rich metadata for every service ─────────────────────────────
const SERVICE_META = {

  // ── VIDEO EDITING — General Services ─────────────────────────
  'Basic Cutting & Assembly': {
    description: 'The foundation of any edit. Raw footage is sorted, synced, and assembled into a clean, watchable sequence. No effects — just precise, professional cuts.',
    includes: ['Footage sorting & organisation', 'Sync multi-camera or audio tracks', 'Clean cut assembly', 'Removal of dead air & mistakes', 'Basic pacing adjustments'],
    bestFor: ['Raw interview footage', 'Event coverage', 'Simple explainer videos', 'First-pass edits before refinement'],
    youtubeExamples: ['Interview channels', 'Event recap videos', 'Simple talking-head content'],
    deliverable: '1080p/4K export, timeline project file',
  },
  'Standard Editing (cuts, transitions, audio sync)': {
    description: 'A complete edit with smooth transitions, synced audio, and polished pacing. The go-to for most YouTube and social media content.',
    includes: ['Jump cuts & smooth transitions', 'Audio sync & leveling', 'Background music integration', 'Basic text overlays', 'Intro/outro placement', 'Pacing & rhythm editing'],
    bestFor: ['YouTube videos', 'Social media content', 'Brand videos', 'Tutorial content'],
    youtubeExamples: ['Ali Abdaal', 'Thomas Frank', 'Matt D\'Avella'],
    deliverable: '1080p/4K export, optimised for platform',
  },
  'Advanced Editing (effects, keyframes, multi-cam)': {
    description: 'High-production editing with keyframe animations, multi-camera switching, and custom effects. For creators who want cinematic quality.',
    includes: ['Multi-camera editing & switching', 'Keyframe animations', 'Custom transitions & effects', 'Advanced audio design', 'Motion blur & speed effects', 'Colour-matched multi-cam footage'],
    bestFor: ['High-production YouTube channels', 'Corporate films', 'Event highlight reels', 'Cinematic content'],
    youtubeExamples: ['Peter McKinnon', 'Sam Kolder', 'Matti Haapoja'],
    deliverable: '4K export with project files',
  },
  'Color Correction (basic look)': {
    description: 'Fixes exposure, white balance, and colour inconsistencies across your footage so every shot looks clean and consistent.',
    includes: ['Exposure & contrast balancing', 'White balance correction', 'Shot-to-shot consistency', 'Skin tone normalisation', 'Basic LUT application'],
    bestFor: ['Raw footage cleanup', 'Interview content', 'Corporate videos', 'Any footage before grading'],
    youtubeExamples: ['Educational channels', 'Corporate content', 'Interview-based shows'],
    deliverable: 'Colour-corrected video export',
  },
  'Color Grading (cinematic look)': {
    description: 'Transforms your footage with a signature cinematic look — moody, warm, cool, or stylised. Elevates production value dramatically.',
    includes: ['Custom LUT creation or application', 'Scene-by-scene grading', 'Cinematic colour palette', 'Highlight & shadow control', 'Skin tone preservation', 'HDR-ready output'],
    bestFor: ['Short films', 'Music videos', 'Travel content', 'Brand films', 'High-end YouTube'],
    youtubeExamples: ['Sam Kolder', 'Finn Harries', 'Ben Brown'],
    deliverable: 'Graded export + LUT file',
  },
  'Audio Cleanup (noise reduction, leveling)': {
    description: 'Removes background noise, hiss, hum, and inconsistent audio levels. Makes dialogue clear and professional.',
    includes: ['Noise reduction & removal', 'Audio leveling & normalisation', 'De-hum & de-hiss', 'Room reverb reduction', 'Dialogue clarity enhancement'],
    bestFor: ['Podcasts', 'Interviews', 'Tutorials', 'Any footage with background noise'],
    youtubeExamples: ['Podcast channels', 'Interview shows', 'Educational content'],
    deliverable: 'Clean audio track + video export',
  },
  'Voiceover Syncing & Pacing': {
    description: 'Syncs recorded voiceover to visuals with precise timing, natural pacing, and smooth transitions between cuts.',
    includes: ['Voiceover-to-visual sync', 'Pacing adjustments', 'Breath & pause editing', 'Music bed balancing', 'Cut-to-beat alignment'],
    bestFor: ['Explainer videos', 'Documentary narration', 'Corporate presentations', 'Ad voiceovers'],
    youtubeExamples: ['Kurzgesagt', 'Wendover Productions', 'Real Engineering'],
    deliverable: 'Synced video export',
  },

  // ── VIDEO EDITING — Popular Formats ──────────────────────────
  'Vlog (basic cuts + color grading)': {
    description: 'Clean, fast-paced vlog editing with jump cuts, colour grading, and basic transitions. Perfect for daily/weekly YouTube content creators.',
    includes: ['Jump cut editing', 'Colour grading (warm/cinematic look)', 'Background music sync', 'Basic text overlays', 'Intro/outro integration', 'Pacing for engagement'],
    bestFor: ['Daily vloggers', 'Travel content', 'Lifestyle channels', 'Personal brand content'],
    youtubeExamples: ['Casey Neistat', 'David Dobrik', 'Emma Chamberlain', 'Nas Daily'],
    deliverable: '1080p/4K export, YouTube-optimised',
  },
  'Documentary': {
    description: 'Full documentary-style editing with narrative structure, interview cuts, B-roll integration, and cinematic pacing. Ideal for long-form storytelling.',
    includes: ['Multi-camera interview editing', 'B-roll & archival footage integration', 'Narrative pacing & story structure', 'Colour grading (documentary look)', 'Ambient sound design', 'Lower thirds & title cards', 'Chapter markers'],
    bestFor: ['YouTube documentary channels', 'Investigative journalism', 'Brand story films', 'Educational deep-dives', 'Social impact content'],
    youtubeExamples: ['Wendover Productions', 'Johnny Harris', 'Kurzgesagt', 'Vice', 'DW Documentary'],
    deliverable: 'Final cut in 4K/1080p with project files',
  },
  'Motion Graphics': {
    description: 'Animated graphics, kinetic typography, and visual effects integrated into video. Elevates production value significantly.',
    includes: ['Animated lower thirds', 'Kinetic typography', 'Logo animations', 'Transition effects', 'Infographic animations', 'Screen recordings with callouts', 'Custom icon animations'],
    bestFor: ['Tech channels', 'Educational content', 'Corporate videos', 'Product explainers', 'News-style content'],
    youtubeExamples: ['MKBHD', 'Linus Tech Tips', 'Fireship', 'Vox'],
    deliverable: 'Rendered video with motion graphics embedded',
  },
  'Music Video (basic cuts & effects)': {
    description: 'Rhythm-synced editing with creative cuts, colour grading, and visual effects timed to the music.',
    includes: ['Beat-synced cuts', 'Colour grading (mood-based)', 'Speed ramps & slow motion', 'Light leaks & overlays', 'Lyric animations (optional)', 'Multi-location cut sync'],
    bestFor: ['Independent artists', 'Record labels', 'Music promotion', 'Live performance edits'],
    youtubeExamples: ['Official music video channels', 'Indie artist channels', 'Vevo'],
    deliverable: '4K export, aspect ratio variants (16:9, 9:16)',
  },
  'Gaming Montage / Highlights': {
    description: 'High-energy gaming content with fast cuts, effects, and hype music sync. Built for engagement and virality.',
    includes: ['Fast-paced cut editing', 'Kill/highlight sync', 'Sound effects & music', 'Zoom effects & transitions', 'Scoreboard/stats overlays', 'Reaction cam integration'],
    bestFor: ['Gaming YouTubers', 'Twitch streamers', 'Esports teams', 'Clip channels'],
    youtubeExamples: ['Shroud', 'Ninja', 'Typical Gamer', 'Faze Clan'],
    deliverable: '1080p/4K, YouTube & Shorts optimised',
  },
  'Subtitling / Captioning (burnt-in)': {
    description: 'Accurate, styled captions burned directly into the video. Increases accessibility and watch time significantly.',
    includes: ['Manual transcription', 'Styled caption design', 'Speaker identification', 'Timing accuracy ±0.5s', 'Multiple language support (on request)', 'Auto-highlight keywords'],
    bestFor: ['Educational channels', 'Podcasts', 'Interview content', 'Accessibility compliance', 'Silent-watch social content'],
    youtubeExamples: ['TED', 'Lex Fridman', 'Andrew Huberman', 'Diary of a CEO'],
    deliverable: 'Video with burnt-in captions + SRT file',
  },
  'Podcast Video Snippet (waveform + graphics)': {
    description: 'Audiogram-style video snippets with animated waveforms, speaker photos, and branded graphics for social sharing.',
    includes: ['Animated waveform', 'Speaker photo/logo', 'Quote text animation', 'Brand colour scheme', 'Square & vertical formats', 'Auto-caption overlay'],
    bestFor: ['Podcast promotion', 'LinkedIn/Instagram clips', 'Twitter/X content', 'YouTube Shorts'],
    youtubeExamples: ['Joe Rogan clips', 'Huberman Lab clips', 'Tim Ferriss clips', 'Diary of a CEO clips'],
    deliverable: '1:1, 9:16, 16:9 formats',
  },
};

// Fallback metadata for items not explicitly listed
function getMetaForItem(item) {
  // Try exact match first
  if (SERVICE_META[item.name]) return SERVICE_META[item.name];
  // Try partial match
  const key = Object.keys(SERVICE_META).find(k =>
    item.name.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
  );
  if (key) return SERVICE_META[key];
  return null;
}

// â”€â”€ Service Detail Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ── Service Detail Sidebar — data from DB ────────────────────────
function ServiceSidebar({ item, onClose, convert, showDiscount }) {
  const navigate = useNavigate();
  const discountedInr = item.rate * (1 - DISCOUNT);
  const normal = convert(item.rate, false);
  const discounted = convert(discountedInr, true);
  const d = item.details || {};
  const hasDetails = d.description || d.includes?.length || d.bestFor?.length;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full z-[200] flex flex-col border-l overflow-hidden"
      style={{ width: "min(440px, 100vw)", background: "var(--bg-secondary)", borderColor: "var(--border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}
    >
      <div className="flex items-start justify-between px-6 py-5 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>Service Details</p>
          <h2 className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{item.name}</h2>
          {item.tolerance && <p className="text-[10px] mt-1 opacity-50" style={{ color: "var(--text-secondary)" }}>Tolerance: {item.tolerance}</p>}
        </div>
        <button onClick={onClose} className="p-2 rounded-xl border shrink-0 transition-all hover:scale-105"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <div className="p-4 rounded-2xl" style={{ background: "var(--bg-card)" }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>Pricing</p>
          {showDiscount ? (
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <p className="text-xs line-through opacity-40" style={{ color: "var(--text-secondary)" }}>{normal.display}</p>
                <p className="text-3xl font-black" style={{ color: "var(--accent)" }}>{discounted.display}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full mb-1"
                style={{ background: "var(--accent)22", color: "var(--accent)" }}>
                <Sparkles size={9} /> 15% off
              </span>
              <p className="text-sm mb-1 ml-auto" style={{ color: "var(--text-secondary)" }}>per {item.unit}</p>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{normal.display}</p>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>per {item.unit}</p>
            </div>
          )}
          {d.turnaround && <p className="text-[10px] mt-2 font-semibold" style={{ color: "var(--text-secondary)" }}>⏱ {d.turnaround}</p>}
        </div>

        {d.description && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>What is this?</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{d.description}</p>
          </div>
        )}

        {d.includes?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>{"What's Included"}</p>
            <div className="space-y-2">
              {d.includes.map((inc, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {d.bestFor?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>Best For</p>
            <div className="flex flex-wrap gap-2">
              {d.bestFor.map((b, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {d.youtubeExamples?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>YouTube References</p>
            <div className="space-y-2">
              {d.youtubeExamples.map((ch, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-card)" }}>
                  <PlayCircle size={14} style={{ color: "#ef4444" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {d.deliverable && (
          <div className="p-4 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>Deliverable</p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{d.deliverable}</p>
          </div>
        )}

        {!hasDetails && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--bg-card)" }}>
            <Info size={16} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Detailed information for this service is being added. Contact us for a full breakdown.</p>
          </div>
        )}
      </div>

      <div className="px-6 py-5 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
        <button onClick={() => navigate("/signup?role=client&redirect=/client/post-project")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--accent)", color: "#fff" }}>
          Post a Project <ArrowRight size={15} />
        </button>
        <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-secondary)" }}>First project gets 15% off — applied automatically</p>
      </div>
    </motion.div>
  );
}


// ── Service card ──────────────────────────────────────────────────
function ServiceBox({ item, index, showDiscount, convert, onSelect }) {
  const discountedInr = item.rate * (1 - DISCOUNT);
  const normal     = convert(item.rate, false);
  const discounted = convert(discountedInr, true);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      onClick={() => onSelect(item)}
      className="group relative overflow-hidden rounded-xl border transition-all duration-300 p-5 cursor-pointer"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      whileHover={{ y: -3, borderColor: "var(--accent)", boxShadow: "0 12px 24px rgba(96,10,10,0.1)" }}
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
                {normal.display}
              </div>
              <div className="text-2xl font-black" style={{ color: "var(--accent)" }}>
                {discounted.display}
              </div>
              <div className="text-[9px] mt-1 flex items-center gap-1" style={{ color: "var(--accent)", opacity: 0.7 }}>
                <Sparkles size={8} /> 15% off
              </div>
            </div>
          ) : (
            <div className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              {normal.display}
            </div>
          )}
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--text-secondary)" }}>
            /{item.unit}
          </span>
        </div>
        <div className="mt-3 text-[10px] font-semibold opacity-0 group-hover:opacity-60 transition-opacity flex items-center gap-1"
          style={{ color: "var(--accent)" }}>
          <Info size={10} /> Tap for details
        </div>
      </div>
    </motion.div>
  );
}
export default function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { convert } = useCurrency();
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [query, setQuery] = useState('');
  const [showDiscount, setShowDiscount] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const sectionRefs = useRef({});

  // Fix scroll-to-top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    getAllPricing()
      .then(res => setAllData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && TABS.find(t => t.key === hash)) {
      setActiveTab(hash);
      setTimeout(() => {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    setQuery('');
    setTimeout(() => {
      sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="pt-44 pb-16 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.05 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg border transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--border)' }}
            >
              <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full"
              style={{ color: 'var(--accent)', borderColor: 'rgba(96,10,10,0.2)', background: 'rgba(96,10,10,0.05)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              Pricing
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4" style={{ color: 'var(--text-primary)' }}>
            Per-unit. No surprises.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Every service is priced per unit of work â€” per minute, per second, per design. You pay for exactly what you get.
          </p>
        </motion.div>
      </section>

      {/* â”€â”€ First Project Discount Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 rounded-xl border"
            style={{
              background: 'rgba(96,10,10,0.04)',
              borderColor: 'rgba(96,10,10,0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  First project? 15% off.
                </span>
                <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>
                  Applied automatically at checkout â€” no code needed.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDiscount(v => !v)}
              className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70 shrink-0"
              style={{ color: 'var(--accent)' }}
            >
              {showDiscount ? 'Hide discount' : 'Show discount'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="px-6 mb-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Search size={16} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search any service across all departmentsâ€¦"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={14} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Search Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-6 mb-10"
          >
            <div className="max-w-5xl mx-auto">
              {searchResults.length === 0 ? (
                <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No services found for "{query}"
                </p>
              ) : (
                <>
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.map((item, i) => (
                      <ServiceBox key={`${item.department}-${item.name}`} item={item} index={i} showDiscount={showDiscount} convert={convert} onSelect={setSelectedItem} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Sticky Tab Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!query.trim() && (
        <div
          className="sticky top-[79px] z-50 px-6 py-3 border-b"
          style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className="relative px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
                  opacity: activeTab === tab.key ? 1 : 0.5,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ Department Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!query.trim() && (
        <div className="px-6 pb-32">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="py-32 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Loading pricingâ€¦
              </div>
            ) : (
              TABS.map(tab => {
                const dept = allData.find(d => d.department === tab.key);
                if (!dept) return null;
                const isActive = activeTab === tab.key;
                return (
                  <div
                    key={tab.key}
                    ref={el => sectionRefs.current[tab.key] = el}
                    id={tab.key}
                    className="pt-16 pb-8"
                    style={{ display: isActive ? 'block' : 'none' }}
                  >
                    {/* Dept header */}
                    <div className="mb-10">
                      <div
                        className="text-xs font-bold uppercase tracking-[0.4em] mb-3"
                        style={{ color: 'var(--accent)' }}
                      >
                        Department
                      </div>
                      <h2
                        className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {dept.displayName}
                      </h2>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Starting from{' '}
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {convert(dept.startingFrom).display}/{dept.startingUnit}
                        </span>
                      </p>
                    </div>

                    {/* Popular Formats */}
                    {dept.popularFormats?.length > 0 && (
                      <div className="mb-12">
                        <div
                          className="text-[10px] font-bold uppercase tracking-[0.4em] mb-5"
                          style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
                        >
                          Popular Formats
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dept.popularFormats.map((item, i) => (
                            <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} convert={convert} onSelect={setSelectedItem} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generalized Services */}
                    <div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
                        style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
                      >
                        {dept.popularFormats?.length > 0 ? 'Generalized Services' : 'All Services'}
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dept.generalServices.map((item, i) => (
                          <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} convert={convert} onSelect={setSelectedItem} />
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

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section
        className="py-24 px-6 border-t text-center relative overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.05 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to post your project?
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Your first project gets 15% off â€” applied automatically at checkout.
          </p>
          <button
            onClick={() => navigate('/signup?role=client')}
            className="btn-primary py-3.5 px-8 text-sm font-bold tracking-wide flex items-center gap-2 mx-auto"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ── Service Detail Sidebar ── */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 z-[199]"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <ServiceSidebar
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              convert={convert}
              showDiscount={showDiscount}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

