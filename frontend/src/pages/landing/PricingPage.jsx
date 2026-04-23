import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, ArrowRight, ChevronLeft, CheckCircle2, Info } from 'lucide-react';
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

// â”€â”€ Rich metadata for each service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SERVICE_META = {
  // Video Editing
  'Documentary': {
    description: 'Full documentary-style editing with narrative structure, interview cuts, B-roll integration, and cinematic pacing. Ideal for long-form storytelling content.',
    includes: ['Multi-camera interview editing', 'B-roll & archival footage integration', 'Narrative pacing & story structure', 'Color grading (documentary look)', 'Ambient sound design', 'Lower thirds & title cards'],
    bestFor: ['YouTube documentary channels', 'Investigative journalism', 'Brand story films', 'Educational deep-dives'],
    youtubeExamples: ['Wendover Productions', 'Johnny Harris', 'Kurzgesagt', 'Vice'],
    deliverable: 'Final cut in 4K/1080p with project files',
  },
  'Vlog (basic cuts + color grading)': {
    description: 'Clean, fast-paced vlog editing with jump cuts, color grading, and basic transitions. Perfect for daily/weekly YouTube content creators.',
    includes: ['Jump cut editing', 'Color grading (warm/cinematic look)', 'Background music sync', 'Basic text overlays', 'Intro/outro integration'],
    bestFor: ['Daily vloggers', 'Travel content', 'Lifestyle channels', 'Personal brand content'],
    youtubeExamples: ['Casey Neistat', 'David Dobrik', 'Emma Chamberlain'],
    deliverable: '1080p/4K export, optimized for YouTube',
  },
  'Motion Graphics': {
    description: 'Animated graphics, kinetic typography, and visual effects integrated into video. Elevates production value significantly.',
    includes: ['Animated lower thirds', 'Kinetic typography', 'Logo animations', 'Transition effects', 'Infographic animations', 'Screen recordings with callouts'],
    bestFor: ['Tech channels', 'Educational content', 'Corporate videos', 'Product explainers'],
    youtubeExamples: ['MKBHD', 'Linus Tech Tips', 'Fireship'],
    deliverable: 'Rendered video with motion graphics embedded',
  },
  'Music Video (basic cuts & effects)': {
    description: 'Rhythm-synced editing with creative cuts, color grading, and visual effects timed to the music.',
    includes: ['Beat-synced cuts', 'Color grading (mood-based)', 'Speed ramps & slow motion', 'Light leaks & overlays', 'Lyric animations (optional)'],
    bestFor: ['Independent artists', 'Record labels', 'Music promotion'],
    youtubeExamples: ['Official music video channels', 'Indie artist channels'],
    deliverable: '4K export, aspect ratio variants (16:9, 9:16)',
  },
  'Gaming Montage / Highlights': {
    description: 'High-energy gaming content with fast cuts, effects, and hype music sync. Built for engagement and virality.',
    includes: ['Fast-paced cut editing', 'Kill/highlight sync', 'Sound effects & music', 'Zoom effects & transitions', 'Scoreboard/stats overlays'],
    bestFor: ['Gaming YouTubers', 'Twitch streamers', 'Esports teams'],
    youtubeExamples: ['Shroud', 'Ninja', 'Typical Gamer'],
    deliverable: '1080p/4K, YouTube & Shorts optimized',
  },
  'Subtitling / Captioning (burnt-in)': {
    description: 'Accurate, styled captions burned directly into the video. Increases accessibility and watch time significantly.',
    includes: ['Manual transcription', 'Styled caption design', 'Speaker identification', 'Timing accuracy Â±0.5s', 'Multiple language support (on request)'],
    bestFor: ['Educational channels', 'Podcasts', 'Interview content', 'Accessibility compliance'],
    youtubeExamples: ['TED', 'Lex Fridman', 'Andrew Huberman'],
    deliverable: 'Video with burnt-in captions + SRT file',
  },
  'Podcast Video Snippet (waveform + graphics)': {
    description: 'Audiogram-style video snippets with animated waveforms, speaker photos, and branded graphics for social sharing.',
    includes: ['Animated waveform', 'Speaker photo/logo', 'Quote text animation', 'Brand color scheme', 'Square & vertical formats'],
    bestFor: ['Podcast promotion', 'LinkedIn/Instagram clips', 'Twitter/X content'],
    youtubeExamples: ['Joe Rogan clips', 'Huberman Lab clips', 'Tim Ferriss clips'],
    deliverable: '1:1, 9:16, 16:9 formats',
  },
  // Graphic Design
  'Logo Design': {
    description: 'Professional brand identity design including primary logo, variations, and usage guidelines.',
    includes: ['3 initial concepts', 'Unlimited revisions (within scope)', 'Vector files (AI, EPS, SVG)', 'PNG/JPG exports', 'Dark & light variants', 'Brand color palette'],
    bestFor: ['Startups', 'Personal brands', 'Small businesses', 'YouTube channels'],
    deliverable: 'Full brand kit with all file formats',
  },
  'Social Media Post (static)': {
    description: 'Eye-catching static social media graphics designed for maximum engagement and brand consistency.',
    includes: ['Platform-optimized dimensions', 'Brand color & font usage', 'High-res export', 'Editable source file'],
    bestFor: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X'],
    deliverable: 'PNG/JPG + editable source file',
  },
  'YouTube Thumbnail': {
    description: 'Click-optimized thumbnails designed with proven CTR principles â€” bold text, contrast, and emotional hooks.',
    includes: ['Custom background design', 'Bold typography', 'Face/subject cutout', 'A/B variant (optional)', 'Brand consistency'],
    bestFor: ['YouTube channels of all sizes', 'Viral content optimization'],
    youtubeExamples: ['MrBeast style', 'Educational channels', 'Tech reviews'],
    deliverable: '1280Ã—720px PNG, web-optimized',
  },
  'Infographic (single page)': {
    description: 'Data-driven visual storytelling that makes complex information digestible and shareable.',
    includes: ['Data visualization', 'Icon design', 'Brand styling', 'Print & web versions', 'Editable source'],
    bestFor: ['Blog content', 'Social sharing', 'Presentations', 'Reports'],
    deliverable: 'PDF + PNG, print-ready resolution',
  },
  // 3D Animation
  'Product Rotation / Turntable': {
    description: 'Clean 360Â° product showcase animation with professional lighting and rendering.',
    includes: ['360Â° rotation', 'Studio lighting setup', 'Material & texture work', 'Background options', '4K render'],
    bestFor: ['E-commerce', 'Product launches', 'Amazon listings', 'Ad campaigns'],
    deliverable: 'MP4 loop, transparent background option',
  },
  'Architectural Walkthrough (external)': {
    description: 'Photorealistic exterior walkthrough of buildings, landscapes, and architectural designs.',
    includes: ['Exterior modeling', 'Landscape & environment', 'Lighting & atmosphere', 'Camera path animation', '4K render'],
    bestFor: ['Real estate', 'Architecture firms', 'Construction companies'],
    deliverable: '4K MP4, project files on request',
  },
  'Character Animation (single, looped, no lip sync)': {
    description: 'Rigged character animation for mascots, explainer videos, and game assets.',
    includes: ['Character rigging', 'Walk/idle/action cycles', 'Smooth looping', 'Export in multiple formats'],
    bestFor: ['Brand mascots', 'Game assets', 'Explainer videos', 'App animations'],
    deliverable: 'MP4 + FBX/GLB on request',
  },
  // CGI / VFX
  'Green Screen Keying': {
    description: 'Professional chroma key removal with edge refinement, spill suppression, and background replacement.',
    includes: ['Chroma key removal', 'Edge refinement', 'Spill suppression', 'Background replacement', 'Color match'],
    bestFor: ['YouTube creators', 'Film production', 'Corporate videos', 'News segments'],
    deliverable: 'Composited video, transparent PNG sequence option',
  },
  'Screen Replacement': {
    description: 'Replace phone, laptop, or monitor screens with custom content using motion tracking.',
    includes: ['Motion tracking', 'Screen content replacement', 'Reflection & glare matching', 'Color grading match'],
    bestFor: ['App demos', 'Tech reviews', 'Commercial ads'],
    deliverable: 'Composited video sequence',
  },
  'Particle VFX (rain, snow, sparks)': {
    description: 'Realistic particle simulations for atmospheric effects, action sequences, and visual enhancement.',
    includes: ['Particle system setup', 'Physics simulation', 'Lighting integration', 'Compositing into footage'],
    bestFor: ['Music videos', 'Film VFX', 'Commercial production'],
    deliverable: 'Composited video + VFX elements separately',
  },
  // Script Writing
  'YouTube Script (vlog, talking head)': {
    description: 'Conversational, engaging scripts written for YouTube talking-head and vlog formats with natural speech patterns.',
    includes: ['Hook & intro', 'Structured narrative', 'Call-to-action', 'SEO keyword integration', 'Revision round'],
    bestFor: ['Educational channels', 'Personal brands', 'Commentary channels'],
    youtubeExamples: ['Veritasium style', 'Mark Rober style', 'Kurzgesagt style'],
    deliverable: 'Google Doc with timestamps & notes',
  },
  'Corporate / Brand Video Script': {
    description: 'Professional brand messaging scripts for company videos, product launches, and investor presentations.',
    includes: ['Brand voice alignment', 'Key message hierarchy', 'Stakeholder-ready language', 'Multiple revision rounds'],
    bestFor: ['Company about pages', 'Product launches', 'Investor decks', 'Trade shows'],
    deliverable: 'Final script + teleprompter format',
  },
  'Explainer Video Script': {
    description: 'Clear, concise scripts that break down complex products or concepts for general audiences.',
    includes: ['Problem-solution structure', 'Simple language', 'Visual cue notes', 'Voiceover-ready format'],
    bestFor: ['SaaS products', 'Fintech', 'Healthcare', 'EdTech'],
    deliverable: 'Script with scene-by-scene breakdown',
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
function ServiceSidebar({ item, onClose, convert, showDiscount }) {
  const navigate = useNavigate();
  const meta = getMetaForItem(item);
  const discountedInr = item.rate * (1 - DISCOUNT);
  const normal = convert(item.rate, false);
  const discounted = convert(discountedInr, true);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full z-[200] flex flex-col border-l overflow-hidden"
      style={{
        width: 'min(420px, 100vw)',
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
            Service Details
          </p>
          <h2 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {item.name}
          </h2>
          {item.tolerance && (
            <p className="text-[10px] mt-1 opacity-50" style={{ color: 'var(--text-secondary)' }}>
              Tolerance: {item.tolerance}
            </p>
          )}
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl border shrink-0 transition-all hover:scale-105"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Pricing */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
            Pricing
          </p>
          {showDiscount ? (
            <div className="flex items-end gap-3">
              <div>
                <p className="text-xs line-through opacity-40" style={{ color: 'var(--text-secondary)' }}>
                  {normal.display}
                </p>
                <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                  {discounted.display}
                </p>
              </div>
              <div className="mb-1">
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'var(--accent)22', color: 'var(--accent)' }}>
                  <Sparkles size={9} /> 15% off
                </span>
              </div>
              <p className="text-sm mb-1 ml-auto" style={{ color: 'var(--text-secondary)' }}>
                per {item.unit}
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                {normal.display}
              </p>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>per {item.unit}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {meta?.description && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              What is this?
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {meta.description}
            </p>
          </div>
        )}

        {/* What's included */}
        {meta?.includes?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              What's Included
            </p>
            <div className="space-y-2">
              {meta.includes.map((inc, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best for */}
        {meta?.bestFor?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              Best For
            </p>
            <div className="flex flex-wrap gap-2">
              {meta.bestFor.map((b, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* YouTube channel references */}
        {meta?.youtubeExamples?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              YouTube Channel References
            </p>
            <div className="space-y-2">
              {meta.youtubeExamples.map((ch, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-card)' }}>
                  <Youtube size={14} style={{ color: '#ef4444' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverable */}
        {meta?.deliverable && (
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Deliverable
            </p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{meta.deliverable}</p>
          </div>
        )}

        {/* No metadata fallback */}
        {!meta && (
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'var(--bg-card)' }}>
            <Info size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Detailed information for this service is being added. Contact us for a full breakdown.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 py-5 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => navigate('/signup?role=client&redirect=/client/post-project')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Post a Project <ArrowRight size={15} />
        </button>
        <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
          First project gets 15% off â€” applied automatically
        </p>
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

