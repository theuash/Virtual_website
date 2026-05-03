import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useSpring, useVelocity } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Video, Cuboid, MonitorPlay, PenTool, Layout,
  ShieldCheck, Users, Volume2, VolumeX, Sparkles, Zap,
  Activity, HardDrive, Layers, Cpu, Globe, Scale, Gavel, CheckCircle2, Clock, Box, Eye, Lock
} from 'lucide-react';
import Header from '../../components/landing/Header';
import PricingStrip from '../../components/landing/PricingStrip';
import logo from '../../assets/logo.png';

// Detect mobile once on mount
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

// Helper Component for 3D Mesh Layers
const MeshGrid = ({ count = 5, speed = 10 }) => (
  <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      <g stroke="var(--accent)" strokeWidth="0.2">
        {[...Array(count + 1)].map((_, i) => {
          const pos = (i * 200) / count;
          return (
            <g key={i}>
              {/* Horizontal lines */}
              <motion.line
                animate={{ strokeDashoffset: [0, 20] }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
                x1="0" y1={pos} x2="200" y2={pos}
                strokeDasharray="2 4"
                opacity={0.3}
              />
              {/* Vertical lines */}
              <motion.line
                animate={{ strokeDashoffset: [0, 20] }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
                x1={pos} y1="0" x2={pos} y2="200"
                strokeDasharray="2 4"
                opacity={0.3}
              />
              {/* Intersection Nodes */}
              {[...Array(count + 1)].map((_, j) => {
                const pos2 = (j * 200) / count;
                return (
                  <motion.circle
                    key={j}
                    cx={pos} cy={pos2} r="1"
                    fill="var(--accent)"
                    animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, delay: (i + j) * 0.2, repeat: Infinity }}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  </div>
);

// Hero CTA - same pop  expand as floating pill and pricing CTA
function HeroExpandingCTA({ onClick }) {
  const [popped, setPopped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !popped) {
          setPopped(true);
          setTimeout(() => setExpanded(true), 500);
        }
      },
      { threshold: 0.8 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [popped]);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      className="relative flex items-center rounded-full overflow-hidden active:scale-95 transition-transform"
      style={{
        backgroundColor: 'var(--text-primary)',
        color: 'var(--bg-primary)',
        boxShadow: '0 0 40px rgba(var(--accent-rgb),0.2)',
        border: 'none',
      }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={popped ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.7 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Arrow - anchor dot */}
      <span className="flex items-center justify-center pl-5 pr-3 py-3.5">
        <ArrowRight size={16} style={{ color: 'var(--bg-primary)' }} />
      </span>

      {/* Text expands after pop */}
      <motion.span
        className="text-sm font-bold tracking-widest whitespace-nowrap overflow-hidden pr-6"
        style={{ color: 'var(--bg-primary)' }}
        initial={{ width: 0, opacity: 0 }}
        animate={expanded ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{
          width: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.25, delay: 0.2 },
        }}
      >
        Hire Elite Talent
      </motion.span>
    </motion.button>
  );
}

// Floating Pill - pop-up first, then content reveals after
function FloatingPill({ splitProgress, navigate, logo, isDark }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [flashBorder, setFlashBorder] = useState(false);
  const hasShown = useRef(false);

  useMotionValueEvent(splitProgress, 'change', (v) => {
    if (v > 0.08 && !hasShown.current) {
      hasShown.current = true;
      setVisible(true);
      setFlashBorder(true);
      // Fade border back after 1.4s
      setTimeout(() => setFlashBorder(false), 1400);
      // Expand content after pill lands
      setTimeout(() => setExpanded(true), 650);
    } else if (v <= 0.04) {
      setVisible(false);
      setExpanded(false);
      setFlashBorder(false);
      hasShown.current = false;
    }
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="floating-pill"
          className="fixed left-1/2 z-[100] pointer-events-auto group"
          style={{ x: '-50%', bottom: 'calc(24px + env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0, y: 40, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8, transition: { duration: 0.25, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
        >
          <div
            className="flex items-center rounded-full relative"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              overflow: 'hidden',
              border: flashBorder
                ? '1px solid var(--accent)'
                : `1px solid var(--border)`,
              transition: 'border-color 0.9s ease, box-shadow 0.3s ease',
              boxShadow: '0 8px 40px rgba(var(--accent-rgb),0.15)',
            }}
          >
            {/* Logo */}
            <div className="flex items-center shrink-0 pl-3.5 pr-3 py-2.5">
              <div
                className="w-5 h-5 flex items-center justify-center"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' }}
              >
                <img
                  src={logo}
                  alt="V"
                  className="w-full h-full object-contain"
                  style={{
                    filter: isDark
                      ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)'
                      : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)',
                  }}
                />
              </div>
            </div>

            {/* Expanding content */}
            <motion.div
              className="flex items-center gap-4 pr-2"
              initial={{ width: 0, opacity: 0 }}
              animate={expanded ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{
                width: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.35, delay: 0.25 },
              }}
              style={{ overflow: 'hidden' }}
            >
              <div className={`w-px h-3.5 shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

              <div className={`w-px h-3.5 shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

              <button
                onClick={() => navigate('/signup?role=client&redirect=/client/post-project')}
                className="py-1.5 px-4 text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all active:scale-95 shrink-0 whitespace-nowrap"
                style={{
                  background: isDark ? 'rgba(140,100,255,0.3)' : 'rgba(110,44,242,0.1)',
                  color: isDark ? '#e8d8ff' : 'rgba(80,20,200,1)',
                  border: `1px solid ${isDark ? 'rgba(180,140,255,0.4)' : 'rgba(110,44,242,0.3)'}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(140,100,255,0.5)' : 'rgba(110,44,242,0.18)';
                  e.currentTarget.style.color = isDark ? '#fff' : 'rgba(60,10,180,1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(140,100,255,0.3)' : 'rgba(110,44,242,0.1)';
                  e.currentTarget.style.color = isDark ? '#e8d8ff' : 'rgba(80,20,200,1)';
                }}
              >
                Post a Project
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const scrollCueCountRef = useRef(0);
  const lastScrollCueYRef = useRef(0);
  const showScrollCueRef = useRef(true);
  const [isMuted, setIsMuted] = useState(true);
  const [manuallyMuted, setManuallyMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [isDark, setIsDark] = useState(!document.documentElement.classList.contains('light'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Scroll & Velocity tracking
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Create an "Enhanced Scroll" value that projects forward based on speed
  // This essentially skips animation distance the faster you scroll
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 150,
    damping: 25,
    mass: 0.3
  });

  // Hero Parallax (Text appears as you scroll down while pinned)
  const heroOpacity = useTransform(smoothScrollY, [0, 500], [0, 1]);
  const heroScale = useTransform(smoothScrollY, [0, 500], [0.95, 1]);
  const heroTextY = useTransform(smoothScrollY, [0, 500], [40, 0]);

  // Video darken as we scroll deeper - keep it brighter until we transition
  const videoOpacity = useTransform(smoothScrollY, [500, 1200], [0.8, 0.2]);

  // Split-screen Parallax
  const splitRef = useRef(null);
  const { scrollYProgress: splitProgress } = useScroll({
    target: splitRef,
    offset: ["start end", "end start"]
  });

  const leftYRaw = useTransform(splitProgress, [0, 1], [0, -200]);
  const rightYRaw = useTransform(splitProgress, [0, 1], [-100, 100]);
  const leftY = isMobile ? 0 : leftYRaw;
  const rightY = isMobile ? 0 : rightYRaw;

  // Music Volume: Constant until section enters, then fades out by 20% into the section view
  const musicVolume = useTransform(splitProgress, [0, 0.2], [1, 0]);

  // Start video and keep it playing
  useEffect(() => {
    if (videoRef.current) {
      // Set up video for optimal playback
      videoRef.current.muted = true;
      videoRef.current.volume = 0.5;

      // Attempt to play with error handling
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started playing successfully
          })
          .catch(() => {
            // Autoplay was prevented, ensure muted and try again
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => { });
          });
      }
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    showScrollCueRef.current = showScrollCue;
  }, [showScrollCue]);

  useEffect(() => {
    scrollCueCountRef.current = 0;
    lastScrollCueYRef.current = scrollY.get();
    setShowScrollCue(true);
    showScrollCueRef.current = true;

    const unsubscribe = scrollY.on('change', (latestY) => {
      if (!showScrollCueRef.current) {
        return;
      }

      const distanceSinceLastCueCount = Math.abs(latestY - lastScrollCueYRef.current);

      if (distanceSinceLastCueCount < 120) {
        return;
      }

      scrollCueCountRef.current += 1;
      lastScrollCueYRef.current = latestY;

      if (scrollCueCountRef.current >= 4) {
        showScrollCueRef.current = false;
        setShowScrollCue(false);
      }
    });

    return () => unsubscribe();
  }, [scrollY]);

  // Location-aware Music Control
  useMotionValueEvent(musicVolume, "change", (v) => {
    if (videoRef.current && !manuallyMuted) {
      videoRef.current.volume = v;

      // Auto-mute/unmute based on scroll position only if NOT manually muted
      if (v <= 0 && !isMuted) {
        setIsMuted(true);
      } else if (v > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setManuallyMuted(newMuted); // Track manual intent
    setShowUnmuteHint(false);

    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      // If unmuting, apply the current location-based volume immediately
      if (!newMuted) {
        videoRef.current.volume = musicVolume.get();
        videoRef.current.play();
      }
    }
  };

  const [activeFeature, setActiveFeature] = useState(0);
  const [taskSetKey, setTaskSetKey] = useState(0);

  // Mastery Horizontal Scroll Logic
  const masteryRef = useRef(null);
  const { scrollYProgress: masteryProgress } = useScroll({
    target: masteryRef,
    offset: ["start start", "end end"]
  });

  // Transform vertical progress to horizontal movement
  // Recalibrated to -125vw for pixel-perfect edge alignment
  const masteryX = useTransform(masteryProgress, [0, 1], ["0vw", "-125vw"]);

  // Feature 0: Continuous Loop logic
  useEffect(() => {
    if (activeFeature === 0) {
      const interval = setInterval(() => {
        setTaskSetKey(prev => prev + 1);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeFeature]);

  // Filter for the logo based on theme
  const logoFilter = isDark
    ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)'
    : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)';

  if (isMobile) {

  }


  if (isMobile) {
    return (
      <div
        className="min-h-screen relative font-sans selection:bg-accent/30 overflow-x-hidden max-w-[100vw]"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        <Header />
        <div className="flex flex-col w-full overflow-x-hidden relative" style={{ background: 'var(--bg-primary)' }}>
          {/* Mobile Hero Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[-20%] w-[60%] h-[300px] bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border rounded-full bg-accent/5 mb-8" style={{ borderColor: 'var(--border)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span style={{ color: 'var(--accent)' }}>The New Standard</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-[0.9] mb-6" style={{ color: 'var(--text-primary)' }}>
                THE TEAM YOU <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--accent-light))' }}>NEVER HAD</span> <br />
                TO BUILD
              </h1>
              <p className="text-base leading-relaxed mb-10 max-w-sm mx-auto font-medium opacity-70" style={{ color: 'var(--text-primary)' }}>
                A fully departmentalized creative platform. Structured teams, escrow protection, and professional accountability.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => navigate('/signup?role=client')}
                  className="w-full py-6 bg-accent text-white font-bold tracking-widest uppercase text-sm rounded-2xl active:scale-95 transition-all shadow-[0_0_40px_rgba(var(--accent-rgb),0.4)]"
                >
                  Hire Elite Talent
                </button>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="w-full py-6 font-bold tracking-widest uppercase text-sm rounded-2xl active:scale-95 transition-transform backdrop-blur-sm border"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                >
                  How it Works
                </button>
              </div>
            </motion.div>
          </section>

          {/* Agency vs Freelance (The Difference) */}
          <section className="py-24 px-6 relative border-y" style={{ borderColor: 'var(--border)', background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <div className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Distinction</div>
              <h2 className="text-3xl font-bold tracking-tight mb-8 leading-tight" style={{ color: 'var(--text-primary)' }}>
                Not a marketplace. <br />
                <span className="opacity-60">A structured agency.</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Structured execution", desc: "Defined chain of command with professional leads." },
                  { title: "Quality assurance", desc: "Momentum Supervisor reviews every single file." },
                  { title: "On-time delivery", desc: "Timelines tracked live, delays flagged automatically." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--accent-rgb), 0.15)' }}>
                      <CheckCircle size={14} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed opacity-50" style={{ color: 'var(--text-primary)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
            <div className="px-6 mb-12">
              <div className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">Investment</div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Structured Pricing</h2>
            </div>
            <PricingStrip />
          </section>

          {/* The Engine Grid */}
          <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
            <div className="mb-14 text-center">
              <div className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Core Architecture</div>
              <h2 className="text-3xl font-bold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>The Engine Behind <br />Every Move</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {[
                { tag: "Intelligence", title: "Micro-Task Distribution Engine", desc: "Complex projects are fragmented into precision-scoped micro-tasks for maximum speed and accuracy." },
                { tag: "Security", title: "Milestone-Based Protection", desc: "Funds are secured within our protected environment the moment a project is posted, released only upon your final approval." },
                { tag: "Accountability", title: "Human-Led Dispute Resolution", desc: "No bots. No algorithms. Every dispute is handled by a trained Dispute Handler with logic and fairness." },
                { tag: "Meritocracy", title: "Algorithmic Growth System", desc: "Advancement in the ecosystem is driven by hard data - accuracy, speed, and consistent quality." },
                { tag: "Visibility", title: "Live Command Dashboard", desc: "Full visibility into your project's heartbeat. Track every single micro-task's progress in real time." },
                { tag: "Quality", title: "Managed Quality Control", desc: "Each fragmented task is personally verified by a Momentum Supervisor before being merged." },
                { tag: "Global", title: "Borderless Talent Pipeline", desc: "Access elite production specialists from every corner of the world through our vetted network." },
                { tag: "Speed", title: "Parallel Execution Flow", desc: "Eliminate linear bottlenecks. Our architecture allows multiple departments to build, test, and refine simultaneously—cutting delivery times by up to 70%." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] border relative overflow-hidden" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] rounded-full" />
                  <div className="text-accent text-[9px] font-black uppercase mb-4 tracking-widest">{item.tag}</div>
                  <h3 className="font-bold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed opacity-50" style={{ color: 'var(--text-primary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 text-center relative overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            <h2 className="text-4xl font-black tracking-tighter mb-10 relative z-10 leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
              READY TO <br /><span className="text-accent">SCALE?</span>
            </h2>
            <button
              onClick={() => navigate('/signup?role=client')}
              className="relative z-10 w-full py-6 bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_50px_rgba(var(--accent-rgb),0.5)] active:scale-95 transition-transform"
            >
              Get Started
            </button>
          </section>

          {/* Mobile Footer */}
          <footer className="pt-20 pb-12 px-6 border-t relative z-30" style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)', paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-end mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src={logo} alt="V" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <span className="font-extrabold text-xl" style={{ color: '#ffffff', letterSpacing: '-0.06em', marginLeft: '1px' }}>irtual</span>
              </div>
              <p className="font-medium text-xs leading-relaxed mb-8 max-w-xs opacity-60" style={{ color: 'rgba(255,255,255,0.6)' }}>
                The elite architecture for the creative economy. Managed execution, premium talent, and absolute accountability.
              </p>

              <div className="flex gap-4 mb-12">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-accent hover:border-accent hover:text-white cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' }}>
                  <span className="font-bold text-xs tracking-wider">X</span>
                </div>
                <div className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-accent hover:border-accent hover:text-white cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' }}>
                  <span className="font-bold text-xs tracking-wider">IN</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12 text-left w-full">
                {[
                  { title: "Platform", links: [["Pricing", "/pricing"], ["About", "/about"], ["How it Works", "/how-it-works"], ["Roles", "/roles"]] },
                  { title: "Services", links: [["Video Editing", "/pricing"], ["Graphic Design", "/pricing"], ["3D Animation", "/pricing"], ["CGI & VFX", "/pricing"]] },
                  { title: "Company", links: [["Careers", "#"], ["Blog", "#"], ["Press", "#"], ["Contact", "#"]] },
                  { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["Cookies", "#"], ["Security", "#"]] },
                ].map(col => (
                  <div key={col.title} className="space-y-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: '#ffffff' }}>{col.title}</h4>
                    <div className="flex flex-col gap-3 text-sm font-medium">
                      {col.links.map(([label, path]) => (
                        <button key={label} onClick={() => navigate(path)} className="text-left opacity-60 hover:opacity-100 hover:text-accent transition-all" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full pt-8 border-t flex flex-col items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 text-center" style={{ color: '#ffffff' }}>
                  &copy; {new Date().getFullYear()} Virtual Inc. Defined by Excellence.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative font-sans selection:bg-accent/30"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <Header />

      {/* Hero Section (Sticky Parallax) */}
      <section className="relative z-10" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-20">
          {/* Background - video served from backend */}
          <div className="absolute inset-0 z-0 bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              className="absolute pointer-events-none"
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: 'auto',
                height: '100%',
                minWidth: '100%',
                transform: 'translateX(-50%)',
                objectFit: 'cover',
                opacity: videoOpacity,
                filter: 'brightness(1) contrast(1.1)',
                willChange: 'opacity',
              }}
            >
              <source src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/assets/v.mp4`} type="video/mp4" />
            </video>
          </div>

          {/* Sound toggle - bottom right */}
          <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
              {isMuted && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                  Click to enable sound
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
              }}
              title={isMuted ? 'Enable sound' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            </button>
          </div>

          <AnimatePresence>
            {showScrollCue && (
              <motion.button
                type="button"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.35, ease: 'easeOut' } }}
                className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-white/75 transition-all hover:text-white flex flex-col items-center gap-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Blur overlay */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 z-10 backdrop-blur-xl pointer-events-none"
          />

          {/* Hero text */}
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroTextY }}
            className="relative z-50 flex flex-col items-center w-full max-w-4xl mx-auto px-4 sm:px-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full" style={{ color: 'var(--accent)', borderColor: 'rgba(var(--accent-rgb),0.2)', background: 'rgba(var(--accent-rgb),0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              The New Standard
            </div>
            <h1 className="text-[clamp(2.1rem,9vw,5rem)] md:text-7xl lg:text-8xl font-bold tracking-tighter text-center mb-4 sm:mb-6 leading-[1.08] text-white drop-shadow-2xl px-2">
              The team you never
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #ffffff 0%, var(--accent) 100%)' }}>
                had to Build
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 font-medium tracking-wide leading-relaxed text-white/90">
              A fully departmentalized creative platform. Structured teams, escrow-protected payments, and a professional chain of command behind every project.
            </p>
            <div className="hidden sm:block">
              <HeroExpandingCTA onClick={() => navigate('/signup?role=client')} />
            </div>
          </motion.div>
        </div>

        {/* Theme bridge gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[400px] sm:h-[800px] pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)' }}
        />
      </section>

      {/* Split Parallax (The Difference) */}
      <section ref={splitRef} className="pt-10 sm:pt-16 pb-16 sm:pb-10 relative z-20 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
              Not a freelance platform. A structured creative agency.
            </h2>
            <p className="font-normal leading-relaxed text-base sm:text-lg mb-6 sm:mb-8 opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Every category operates as its own department with a designated head - personally accountable for every deliverable. You get a professional chain of command, not a random freelancer.
            </p>
            <ul className="space-y-4 sm:space-y-6">
              {[
                "Structured execution - defined chain of command",
                "Quality assurance - Momentum Supervisor reviews every deliverable",
                "On-time delivery - timelines tracked live, delays flagged internally"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 sm:gap-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <motion.div style={{ y: rightY }} className="relative w-full hidden md:flex flex-col justify-center gap-3 overflow-hidden h-[340px]">
            {/* Fade masks top/bottom */}
            <div className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, var(--bg-primary), transparent)' }} />
            <div className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
            {/* Fade masks left/right */}
            <div className="absolute inset-y-0 left-0 w-10 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, var(--bg-primary), transparent)' }} />
            <div className="absolute inset-y-0 right-0 w-10 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, var(--bg-primary), transparent)' }} />

            {[
              {
                dir: 1, speed: 30,
                items: [
                  { label: 'Micro-Task Distribution', href: '/how-it-works#core-platform', available: true },
                  { label: 'Escrow Protection', href: '/about#escrow-protection', available: true },
                  { label: 'Quality Assurance', href: '/about#quality-assurance', available: true },
                  { label: 'Structured Teams', href: '/about#structured-teams', available: true },
                ],
              },
              {
                dir: -1, speed: 24,
                items: [
                  { label: 'Project Initiator', href: '/roles#project-initiator', available: true },
                  { label: 'Momentum Supervisor', href: '/roles#momentum-supervisor', available: true },
                  { label: 'Earn While You Learn', href: '/about#earn-while-you-learn', available: true },
                  { label: 'Crate', href: '/roles#crate', available: true },
                ],
              },
              {
                dir: 1, speed: 36,
                items: [
                  { label: 'Video Editing', href: '/pricing#video_editing', available: true },
                  { label: 'Graphic Design', href: '/pricing#graphic_designing', available: true },
                  { label: '3D Animation', href: '/pricing#3d_animation', available: true },
                  { label: 'CGI & VFX', href: '/pricing#cgi', available: true },
                  { label: 'Script Writing', href: '/pricing#script_writing', available: true },
                ],
              },
              {
                dir: -1, speed: 28,
                items: [
                  { label: 'Merit-Based Promotion', href: '/roles#merit-based-promotion', available: true },
                  { label: 'Real Portfolio Work', href: '/about#real-portfolio-work', available: true },
                  { label: 'Chain of Command', href: '/about#chain-of-command', available: true },
                  { label: 'How a Project Works', href: '/how-it-works#how-a-project-works', available: true },
                ],
              },
            ].map((row, i) => (
              <div key={i} className="flex gap-3 whitespace-nowrap">
                <motion.div
                  animate={{ x: row.dir > 0 ? [-200, 0] : [0, -200] }}
                  transition={{ duration: row.speed, repeat: Infinity, ease: "linear" }}
                  className="flex gap-3"
                >
                  {[...row.items, ...row.items].map((item, j) => (
                    <button
                      key={j}
                      onClick={() => navigate(item.href)}
                      className="px-6 py-3 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-accent hover:text-white"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Strip Section */}
      <PricingStrip />
      {/* Mastery Section (Sticky Scrolling Feature Showroom) */}
      <section ref={masteryRef} className="relative z-20 -mt-24 md:-mt-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col lg:flex-row gap-10">

          {/* Left Side: Sticky Professional UI Dashboard */}
          <div className="w-full lg:w-1/2 sticky top-0 h-screen flex items-center justify-center z-10">
            <div className="relative w-full aspect-[16/10] max-w-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--bg-card)' }}>

              {/* Window Header (Apple Style) */}
              <div className="h-8 border-b border-white/5 flex items-center px-4 gap-1.5" style={{ background: 'var(--bg-secondary)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                <div className="ml-4 h-3 w-32 rounded-full bg-white/5" />
              </div>

              {/* Feature Content Area */}
              <div className="p-10 h-full relative overflow-hidden">

                {/* Feature 0: Intelligence (Task Fragmentation UI) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeFeature === 0 ? 1 : 0 }}
                  className="absolute inset-0 p-10 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-8 h-full">
                    {/* Input Block */}
                    <div className="w-1/3 border rounded-2xl p-6 flex flex-col justify-center gap-4 relative z-10 shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)' }}>
                        <Layers size={20} className="text-accent" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-3/4 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.8)' }} />
                        <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.15)' }} />
                        <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.15)' }} />
                      </div>
                    </div>

                    {/* Connecting Lines */}
                    <div className="flex-1 relative h-full flex flex-col justify-center gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex-1 relative flex items-center w-full">
                          <div className="absolute w-full h-[1px]" style={{ backgroundColor: 'var(--border)' }} />
                          <motion.div
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                            className="absolute w-12 h-[2px] bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Output Processors */}
                    <div className="w-1/3 space-y-4 relative z-10">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: activeFeature === 0 ? 0 : 20, opacity: activeFeature === 0 ? 1 : 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="border rounded-xl p-4 flex items-center gap-4 bg-opacity-50 backdrop-blur-md"
                          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                        >
                          <motion.div
                            animate={{ rotate: activeFeature === 0 ? 360 : 0 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-dashed rounded-full border-accent/40"
                          />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                            <div className="h-1 w-1/2 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Feature 1: Milestone Protection (Professional Layout) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: activeFeature === 1 ? 1 : 0, scale: activeFeature === 1 ? 1 : 0.98 }}
                  className="absolute inset-0 p-10 flex flex-col gap-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-accent" />
                        <div className="h-3 w-32 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.15)' }} />
                      </div>
                      <div className="text-5xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>$12,450<span className="text-3xl opacity-50">.00</span></div>
                    </div>
                    <div className="px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)', borderColor: 'rgba(var(--accent-rgb), 0.3)', color: 'var(--accent)' }}>
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
                      Vault Secured
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <motion.div
                          animate={{ opacity: activeFeature === 1 ? [0, 0.1, 0] : 0 }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                          className="absolute inset-0 bg-accent"
                        />
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-opacity-50" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                          <CheckCircle2 size={12} className="text-accent" />
                        </div>
                        <div className="space-y-2 mt-4 relative z-10">
                          <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: 'rgba(var(--text-secondary-rgb), 0.4)' }} />
                          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                          <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Feature 2: Dispute (Professional Review UI) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: activeFeature === 2 ? 1 : 0, x: activeFeature === 2 ? 0 : 20 }}
                  className="absolute inset-0 p-10 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-32 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                      <div className="h-6 w-16 rounded-lg border flex items-center justify-center gap-1" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)', borderColor: 'rgba(var(--accent-rgb), 0.2)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <div className="h-1.5 w-6 rounded-full bg-accent/50" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative border rounded-xl overflow-hidden p-6 space-y-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {/* Left side message */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: activeFeature === 2 ? 1 : 0, x: activeFeature === 2 ? 0 : -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start gap-3 w-[85%]"
                    >
                      <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }} />
                      <div className="space-y-2 flex-1 border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                      </div>
                    </motion.div>

                    {/* Right side message */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: activeFeature === 2 ? 1 : 0, x: activeFeature === 2 ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-start gap-3 w-[85%] ml-auto flex-row-reverse"
                    >
                      <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }} />
                      <div className="space-y-2 flex-1 border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                        <div className="h-1.5 w-1/2 rounded-full ml-auto" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                      </div>
                    </motion.div>

                    {/* Dispute Handler Intervention */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: activeFeature === 2 ? 1 : 0, scale: activeFeature === 2 ? 1 : 0.9, y: activeFeature === 2 ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="absolute bottom-6 left-6 right-6 border rounded-xl flex items-center px-4 py-3 justify-between shadow-xl backdrop-blur-md"
                      style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)', borderColor: 'rgba(var(--accent-rgb), 0.3)' }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: activeFeature === 2 ? [-15, 15, -15] : 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-accent"
                        >
                          <Gavel size={14} className="text-white" />
                        </motion.div>
                        <div>
                          <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Human Handler</div>
                          <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.3)' }} />
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-md bg-accent text-white text-[9px] font-bold uppercase tracking-widest shadow-lg">Resolved</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Feature 3: Growth (Analytics UI) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeFeature === 3 ? 1 : 0 }}
                  className="absolute inset-0 p-10 flex flex-col"
                >
                  <div className="flex justify-between items-end mb-8">
                    <div className="space-y-2">
                      <div className="h-3 w-32 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.15)' }} />
                      <div className="text-4xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>+42.8%</div>
                    </div>
                    <div className="flex gap-1 items-end h-8 relative">
                      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => (
                        <div key={i} className="relative h-full flex items-end">
                          <motion.div
                            animate={{ opacity: activeFeature === 3 ? [0, 1, 0] : 0, y: activeFeature === 3 ? [0, -15] : 0 }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold text-accent whitespace-nowrap"
                          >
                            +{Math.round(h * 20)}
                          </motion.div>
                          <motion.div
                            animate={{ height: activeFeature === 3 ? [`${h * 100}%`, `${Math.max(0.2, h - 0.2) * 100}%`, `${h * 100}%`] : '10%' }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                            className="w-2 rounded-t-sm"
                            style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.3)' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 relative border-l border-b" style={{ borderColor: 'var(--border)' }}>
                    <svg className="w-full h-full overflow-visible">
                      <motion.path
                        d="M 0 150 Q 50 140 100 120 T 200 130 T 300 80 T 400 20"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: activeFeature === 3 ? 1 : 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                      <motion.circle
                        r="4" fill="var(--accent)"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: activeFeature === 3 ? "100%" : "0%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ offsetPath: 'path("M 0 150 Q 50 140 100 120 T 200 130 T 300 80 T 400 20")' }}
                      />
                      <motion.circle
                        r="10" fill="rgba(var(--accent-rgb), 0.3)"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: activeFeature === 3 ? "100%" : "0%", scale: activeFeature === 3 ? [1, 1.5, 1] : 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ offsetPath: 'path("M 0 150 Q 50 140 100 120 T 200 130 T 300 80 T 400 20")' }}
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Feature 4: Live Command Dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: activeFeature === 4 ? 1 : 0, y: activeFeature === 4 ? 0 : 10 }}
                  className="absolute inset-0 p-10 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-40 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.15)' }} />
                    <div className="flex items-center gap-2 px-2 py-1 border rounded-md" style={{ borderColor: 'var(--border)' }}>
                      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Live Sync</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="col-span-2 border rounded-xl p-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ opacity: activeFeature === 4 ? [0.3, 1, 0.3] : 0.3 }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.4)' }}
                            />
                            <div className="space-y-1.5">
                              <div className="h-2 w-24 rounded-full" style={{ backgroundColor: 'var(--text-secondary)', opacity: 0.5 }} />
                              <div className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--text-secondary)' }}>TSK-{1042 + i}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                              <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 3 + i, repeat: Infinity }} className="h-full bg-accent" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-span-1 border rounded-xl p-4 flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <div className="aspect-square rounded-lg border flex items-center justify-center relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        <Globe size={40} className="text-accent opacity-20 absolute" />
                        <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-4 h-4 rounded-full border border-accent absolute" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent absolute" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                        <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                        <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 5: Quality (Checklist Verification UI) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: activeFeature === 5 ? 1 : 0, scale: activeFeature === 5 ? 1 : 0.98 }}
                  className="absolute inset-0 p-10 flex flex-col gap-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)' }}>
                        <CheckCircle2 size={20} className="text-accent" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[12px] font-bold uppercase tracking-widest text-accent">Quality Protocol</div>
                        <div className="h-2 w-24 rounded-full" style={{ backgroundColor: 'var(--text-secondary)', opacity: 0.5 }} />
                      </div>
                    </div>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-3 py-1.5 rounded-md bg-accent text-white text-[9px] font-bold uppercase tracking-widest shadow-sm"
                    >
                      Active
                    </motion.div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {['Source Validation', 'Syntax Integrity', 'Logic Consistency', 'Final Sign-off'].map((label, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: activeFeature === 5 ? 1 : 0, x: activeFeature === 5 ? 0 : -10 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex flex-col justify-center p-5 rounded-xl border relative overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{label}</div>
                          <motion.div
                            animate={{
                              backgroundColor: activeFeature === 5 ? ['rgba(var(--text-secondary-rgb), 0.1)', 'rgba(34, 197, 94, 0.2)', 'rgba(var(--text-secondary-rgb), 0.1)'] : 'rgba(var(--text-secondary-rgb), 0.1)',
                              borderColor: activeFeature === 5 ? ['var(--border)', 'rgba(34, 197, 94, 0.5)', 'var(--border)'] : 'var(--border)'
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="w-8 h-8 rounded-full border flex items-center justify-center"
                          >
                            <motion.div
                              animate={{ scale: activeFeature === 5 ? [0, 1, 0] : 0 }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            >
                              <CheckCircle2 size={16} className="text-green-500" />
                            </motion.div>
                          </motion.div>
                        </div>
                        <div className="space-y-2 relative z-10 w-2/3">
                          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                          <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Feature 6: Pipeline (Global Map UI) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: activeFeature === 6 ? 1 : 0, scale: activeFeature === 6 ? 1 : 0.98 }}
                  className="absolute inset-0 p-10 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-3 w-48 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="px-3 py-1 border rounded-full text-[9px] font-bold uppercase tracking-widest text-accent flex items-center gap-2" style={{ borderColor: 'rgba(var(--accent-rgb), 0.3)', backgroundColor: 'rgba(var(--accent-rgb), 0.05)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Live Network
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {/* Scanning background glow */}
                        <motion.div
                          animate={{ opacity: activeFeature === 6 ? [0, 0.1, 0] : 0 }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="absolute inset-0 bg-accent"
                        />

                        <div className="flex justify-between items-start relative z-10">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <Globe size={14} className="text-accent/70" />
                          </div>
                          <motion.div
                            animate={{ opacity: activeFeature === 6 ? [0.2, 1, 0.2] : 0.2 }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-accent shadow-[0_0_5px_rgba(var(--accent-rgb),1)]"
                          />
                        </div>

                        <div className="space-y-2 relative z-10 mt-6">
                          <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }} />
                          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                          <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Feature 7: Speed (Parallel Execution UI) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeFeature === 7 ? 1 : 0 }}
                  className="absolute inset-0 p-10 flex flex-col justify-center gap-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-32 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="h-3 w-16 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.2)' }} />
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="text-[9px] font-bold text-accent">Active</div>
                      </div>
                      <div className="h-1 w-full rounded-full overflow-hidden relative" style={{ backgroundColor: 'var(--border)' }}>
                        <motion.div
                          animate={{
                            left: activeFeature === 7 ? ['-100%', '100%'] : '-100%',
                          }}
                          transition={{
                            duration: 1.5 + i * 0.2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-y-0 w-1/3"
                          style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.4)' }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Side: Normal Scrolling Descriptions */}
          <div className="w-full lg:w-1/2 pt-[35vh] pb-[15vh]">
            {[
              { tag: "Intelligence", title: "Micro-Task Distribution Engine", desc: "Complex projects are fragmented into precision-scoped micro-tasks for maximum speed and accuracy." },
              { tag: "Security", title: "Milestone-Based Protection", desc: "Funds are secured within our protected environment the moment a project is posted, released only upon your final approval." },
              { tag: "Accountability", title: "Human-Led Dispute Resolution", desc: "No bots. No algorithms. Every dispute is handled by a trained Dispute Handler with logic and fairness." },
              { tag: "Meritocracy", title: "Algorithmic Growth System", desc: "Advancement in the ecosystem is driven by hard data - accuracy, speed, and consistent quality." },
              { tag: "Visibility", title: "Live Command Dashboard", desc: "Full visibility into your project's heartbeat. Track every single micro-task's progress in real time." },
              { tag: "Quality", title: "Managed Quality Control", desc: "Each fragmented task is personally verified by a Momentum Supervisor before being merged." },
              { tag: "Global", title: "Borderless Talent Pipeline", desc: "Access elite production specialists from every corner of the world through our vetted network." },
              { tag: "Speed", title: "Parallel Execution Flow", desc: "Eliminate linear bottlenecks. Our architecture allows multiple departments to build, test, and refine simultaneously—cutting delivery times by up to 70%." }
            ].map((item, i) => (
              <motion.div
                key={i}
                onViewportEnter={() => setActiveFeature(i)}
                viewport={{ amount: 0.7, once: false }}
                initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[70vh] flex flex-col justify-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 text-accent">
                  {item.tag}
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-lg md:text-xl font-normal leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Apple-Style Floating Action Bar (Pill) */}
      <AnimatePresence>
        <FloatingPill splitProgress={splitProgress} navigate={navigate} logo={logo} isDark={isDark} />
      </AnimatePresence>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-24 relative z-20 overflow-hidden border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        {/* Cinematic Background Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 sm:mb-6 leading-[1.1]"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to build with
            <br />
            <motion.span
              initial={{ backgroundPosition: '200% center' }}
              whileInView={{ backgroundPosition: '0% center' }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
              viewport={{ once: true }}
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--text-primary) 0%, var(--accent) 50%, var(--text-primary) 100%)',
                backgroundSize: '200% auto'
              }}
            >
              a real team behind you?
            </motion.span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10"
          >
            <button
              onClick={() => navigate('/signup?role=client&redirect=/client/post-project')}
              className="btn-primary w-full sm:w-auto py-5 px-10 text-sm font-bold tracking-widest uppercase rounded-full shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.4)] hover:shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.6)] hover:-translate-y-1 transition-all"
            >
              Post a Project
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 sm:pt-32 pb-12 sm:pb-16 relative z-30 border-t" style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)', paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-16 mb-12 sm:mb-24">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="flex items-end mb-6 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src={logo} alt="V" className="w-full h-full object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <span className="font-extrabold text-2xl" style={{ color: '#ffffff', letterSpacing: '-0.06em', marginLeft: '1px' }}>irtual</span>
              </div>
              <p className="font-medium text-sm leading-relaxed mb-8 max-w-xs opacity-60" style={{ color: 'rgba(255,255,255,0.6)' }}>
                The elite architecture for the creative economy. Managed execution, premium talent, and absolute accountability for world-class visions.
              </p>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-accent hover:border-accent hover:text-white cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' }}>
                  <span className="font-bold text-xs tracking-wider">X</span>
                </div>
                <div className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-accent hover:border-accent hover:text-white cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' }}>
                  <span className="font-bold text-xs tracking-wider">IN</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-8">
              {[
                { title: "Platform", links: [["Pricing", "/pricing"], ["About", "/about"], ["How it Works", "/how-it-works"], ["Roles", "/roles"]] },
                { title: "Services", links: [["Video Editing", "/pricing"], ["Graphic Design", "/pricing"], ["3D Animation", "/pricing"], ["CGI & VFX", "/pricing"]] },
                { title: "Company", links: [["Careers", "#"], ["Blog", "#"], ["Press", "#"], ["Contact", "#"]] },
                { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["Cookies", "#"], ["Security", "#"]] },
              ].map(col => (
                <div key={col.title} className="space-y-6">
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: '#ffffff' }}>{col.title}</h4>
                  <div className="flex flex-col gap-4 text-sm font-medium">
                    {col.links.map(([label, path]) => (
                      <button key={label} onClick={() => navigate(path)} className="text-left opacity-60 hover:opacity-100 hover:text-accent transition-all" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col justify-center items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 text-center" style={{ color: '#ffffff' }}>
              &copy; {new Date().getFullYear()} Virtual Inc. Defined by Excellence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



