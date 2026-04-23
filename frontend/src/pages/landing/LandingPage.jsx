import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useSpring, useVelocity } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Video, Cuboid, MonitorPlay, PenTool, Layout,
  ShieldCheck, Users, Volume2, VolumeX,
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

// Hero CTA â€” same pop â†’ expand as floating pill and pricing CTA
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
        backgroundColor: '#FFFFFF',
        color: 'var(--accent)',
        boxShadow: '0 0 40px rgba(255,255,255,0.4)',
        border: 'none',
      }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={popped ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.7 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Arrow â€” anchor dot */}
      <span className="flex items-center justify-center pl-5 pr-3 py-3.5">
        <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
      </span>

      {/* Text expands after pop */}
      <motion.span
        className="text-sm font-bold tracking-widest whitespace-nowrap overflow-hidden pr-6"
        style={{ color: 'var(--accent)' }}
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

// Floating Pill â€” pop-up first, then content reveals after
function FloatingPill({ splitProgress, navigate, logo, isDark }) {
  const [visible,   setVisible]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
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
          className="fixed bottom-6 left-1/2 z-[100] pointer-events-auto group"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 40, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8, transition: { duration: 0.25, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
        >
          <div
            className="flex items-center rounded-full relative"
            style={{
              background: isDark
                ? 'rgba(30, 20, 60, 0.92)'
                : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              overflow: 'hidden',
              border: flashBorder
                ? '1px solid rgba(110,44,242,0.95)'
                : `1px solid ${isDark ? 'rgba(140,100,255,0.35)' : 'rgba(110,44,242,0.3)'}`,
              transition: 'border-color 0.9s ease, box-shadow 0.3s ease',
              boxShadow: isDark
                ? '0 8px 40px rgba(110,44,242,0.6), inset 0 1px 0 rgba(180,140,255,0.15)'
                : '0 8px 40px rgba(110,44,242,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
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
                width:   { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
  const effectiveScroll = useTransform([scrollY, scrollVelocity], ([latestY, latestVel]) => {
    return latestY + (latestVel * 0.2); // 0.2 factor for aggressive skipping
  });

  const smoothScrollY = useSpring(effectiveScroll, {
    stiffness: 150,
    damping: 25,
    mass: 0.3
  });

  // Hero Parallax
  const heroOpacity = useTransform(smoothScrollY, [100, 400], [0, 1]);
  const heroScale = useTransform(smoothScrollY, [100, 400], [0.9, 1]);
  const heroTextY = useTransform(smoothScrollY, [100, 400], [40, 0]);

  // Video darken as we scroll deeper
  const videoOpacity = useTransform(smoothScrollY, [400, 900], [0.7, 0.2]);

  // Split-screen Parallax
  const splitRef = useRef(null);
  const { scrollYProgress: splitProgress } = useScroll({
    target: splitRef,
    offset: ["start end", "end start"]
  });

  const leftYRaw = useTransform(splitProgress, [0, 1], [50, -150]);
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
            videoRef.current.play().catch(() => {});
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
      <section className="relative z-10" style={{ height: 'calc(100vh + 800px)' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-20">
          {/* Background — video served from backend */}
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
                top: '50%',
                left: '50%',
                width: '100vw',
                height: '56.25vw',
                minHeight: '100vh',
                minWidth: '177.78vh',
                transform: 'translate(-50%, -50%)',
                objectFit: 'cover',
                opacity: videoOpacity,
                filter: 'brightness(1) contrast(1.1)',
                willChange: 'opacity',
              }}
            >
              <source src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/assets/v.mp4`} type="video/mp4" />
            </video>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, #000 0%, transparent 12%, transparent 88%, #000 100%)", zIndex: 1 }} />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: heroOpacity, background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.45)", zIndex: 2 }}
            />
          </div>

          {/* Sound toggle — bottom right */}
          <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-2">
            {/* Tooltip — shown when muted */}
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
                className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-white/75 transition-all hover:text-white"
              />
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
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full" style={{ color: 'var(--accent)', borderColor: 'rgba(96,10,10,0.2)', background: 'rgba(96,10,10,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              The New Standard
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-center mb-4 sm:mb-6 leading-[1.08] text-white drop-shadow-2xl">
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
      <section ref={splitRef} className="py-16 sm:pt-16 sm:pb-10 relative z-20 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div style={{ y: leftY }} className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
              Not a freelance platform. A structured creative agency.
            </h2>
            <p className="font-normal leading-relaxed text-base sm:text-lg mb-6 sm:mb-8 opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Every category operates as its own department with a designated head â€” personally accountable for every deliverable. You get a professional chain of command, not a random freelancer.
            </p>
            <ul className="space-y-4 sm:space-y-6">
              {[
                "Structured execution â€” defined chain of command",
                "Quality assurance â€” Momentum Supervisor reviews every deliverable",
                "On-time delivery â€” timelines tracked live, delays flagged internally"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 sm:gap-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

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
                  { label: 'Escrow Protection',        href: '/about#escrow-protection',       available: true },
                  { label: 'Quality Assurance',        href: '/about#quality-assurance',       available: true },
                  { label: 'Structured Teams',         href: '/about#structured-teams',        available: true },
                ],
              },
              {
                dir: -1, speed: 24,
                items: [
                  { label: 'Project Initiator',    href: '/roles#project-initiator',    available: true },
                  { label: 'Momentum Supervisor',  href: '/roles#momentum-supervisor',  available: true },
                  { label: 'Earn While You Learn', href: '/about#earn-while-you-learn', available: true },
                  { label: 'Crate',                href: '/roles#crate',                available: true },
                ],
              },
              {
                dir: 1, speed: 36,
                items: [
                  { label: 'Video Editing',   href: '/pricing#video_editing',    available: true },
                  { label: 'Graphic Design',  href: '/pricing#graphic_designing', available: true },
                  { label: '3D Animation',    href: '/pricing#3d_animation',     available: true },
                  { label: 'CGI & VFX',       href: '/pricing#cgi',              available: true },
                  { label: 'Script Writing',  href: '/pricing#script_writing',   available: true },
                ],
              },
              {
                dir: -1, speed: 28,
                items: [
                  { label: 'Merit-Based Promotion', href: '/roles#merit-based-promotion',   available: true },
                  { label: 'Real Portfolio Work',   href: '/about#real-portfolio-work',     available: true },
                  { label: 'Chain of Command',      href: '/about#chain-of-command',        available: true },
                  { label: 'How a Project Works',   href: '/how-it-works#how-a-project-works', available: true },
                ],
              },
            ].map((row, rowIdx) => {
              const doubled = [...row.items, ...row.items, ...row.items];
              return (
                <div key={rowIdx} className="flex overflow-hidden">
                  <motion.div
                    className="flex gap-3 shrink-0"
                    animate={{ x: row.dir === 1 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
                    transition={{ duration: row.speed, repeat: Infinity, ease: 'linear' }}
                  >
                    {doubled.map((item, i) => (
                      item.available ? (
                        <a key={i} href={item.href}
                          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all hover:scale-105 cursor-pointer"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span key={i}
                          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap opacity-30 cursor-not-allowed"
                          style={{ border: '1px dashed var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
                          title="Coming soon"
                        >
                          {item.label}
                        </span>
                      )
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Strip â€” right after split section */}
      <PricingStrip />

      {/* The Core Engine */}
      <section className="relative z-20" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Mobile: simple stacked cards */}
          <div className="lg:hidden py-12 space-y-10">
            {[
              { tag: "Intelligence", title: "Micro-Task Distribution Engine", desc: "Projects are fragmented into precision-scoped tasks. AI-driven mastery tiers match each task to the right specialist â€” not just whoever is available." },
              { tag: "Security", title: "Wallet & Escrow Protection", desc: "Funds lock into escrow when a project is posted. Released only after you formally approve the completed work." },
              { tag: "Accountability", title: "Human-Led Dispute Resolution", desc: "Every dispute is handled by a trained Dispute Handler â€” not a chatbot. A structured meeting with all parties inside Virtual's own video meet window." },
              { tag: "Meritocracy", title: "Algorithmic Growth System", desc: "Advancement is driven by data â€” accuracy, speed, and volume. When metrics cross a threshold, the system promotes automatically." },
              { tag: "Visibility", title: "Live Command Dashboard", desc: "See every micro-task in real time â€” in progress, under review, completed. Communicate directly with your Project Initiator." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <div className="text-xs font-bold uppercase tracking-[0.3em] mb-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>
                  {item.tag}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: original sticky parallax layout */}
          <div className="hidden lg:flex flex-row gap-20">
            {/* Left sticky graphics panel */}
            <div className="lg:w-1/2 h-screen sticky top-0 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              <div className="light-texture" />
              <div className="light-vignette" />
              
              {/* Feature 0 Overlay: Blocked Task Distribution (The Fragmentation Engine) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: activeFeature === 0 ? 1 : 0,
                  scale: activeFeature === 0 ? 1 : 0.95,
                  y: activeFeature === 0 ? 0 : 20
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <div className="relative w-full h-full p-20 overflow-hidden">
                  {/* The Fragmentation Engine - Continuous Loop */}
                  <AnimatePresence mode="popLayout">
                    {activeFeature === 0 && (
                      <motion.div
                        key={taskSetKey}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ x: "120%", opacity: 0 }}
                        transition={{ duration: 1, ease: [0.45, 0, 0.55, 1] }}
                        className="absolute inset-x-20 inset-y-40"
                      >
                        {/* Background Data Glows */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.05)_0%,_transparent_100%)]"></div>

                        {/* Structured Task Registry Blocks */}
                        <div className="grid grid-cols-4 grid-rows-6 gap-6 h-full">
                          {[...Array(24)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -100, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: i * 0.05,
                                ease: "easeOut"
                              }}
                              className="group relative border bg-white/[0.02] backdrop-blur-md rounded-sm overflow-hidden flex flex-col justify-between p-4"
                              style={{ borderColor: 'var(--border)' }}
                              whileHover={{ borderColor: 'var(--accent)', transition: { duration: 0.2 } }}
                            >
                              {/* Animated Filling Bar */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                                className="absolute top-0 left-0 h-0.5"
                                style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}
                              ></motion.div>

                              <div className="flex justify-between items-start">
                                <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }}></div>
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                              </div>

                              <div className="space-y-1.5 mt-auto">
                                <div className="w-full h-1 bg-white/5 rounded-full"></div>
                                <div className="w-2/3 h-1 bg-white/5 rounded-full"></div>
                              </div>

                              {/* Hover Effect */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: 'var(--accent)' }}></div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Distribution Signal Lines */}
                        <svg className="absolute inset-[-40px] w-[calc(100%+80px)] h-[calc(100%+80px)] pointer-events-none" style={{ opacity: 0.1 }}>
                          {[...Array(6)].map((_, i) => (
                            <motion.line
                              key={i}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              x1="0" y1={`${i * 20}%`}
                              x2="100%" y2={`${i * 20}%`}
                              stroke="var(--text-primary)"
                              strokeWidth={1}
                            />
                          ))}
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Feature 1 Overlay: Sovereign Escrow (The Vault) - Kept as requested "second is good" */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: activeFeature === 1 ? 1 : 0,
                  scale: activeFeature === 1 ? 1 : 0.95,
                  y: activeFeature === 1 ? 0 : 20
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, var(--anim-glow) 0%, transparent 50%)', opacity: 0.03 }}></div>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotate: i % 2 === 0 ? [0, 90] : [0, -90],
                      scale: [1, 1.05, 1],
                      borderColor: i < 3 ? 'var(--accent)' : 'var(--border)',
                      boxShadow: i === 0 ? 'var(--anim-shadow)' : 'none'
                    }}
                    transition={{
                      duration: 12 + i * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear"
                    }}
                    className="absolute border border-t-2 border-l-2 rounded-[2rem]"
                    style={{
                      width: `${240 + i * 80}px`,
                      height: `${240 + i * 80}px`,
                      opacity: 0.25 - (i * 0.02),
                      borderStyle: 'solid',
                      borderWidth: i < 1 ? '1px' : '0.5px'
                    }}
                  />
                ))}
                {/* Central Security Icon - Muted Sophistication */}
                <div className="z-10 opacity-25 relative animate-pulse-slow" style={{ color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={360} strokeWidth={0.3} />
                </div>
              </motion.div>

              {/* Feature 2 Overlay: Managed Resolution (The Grid Protocol) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: activeFeature === 2 ? 1 : 0,
                  scale: activeFeature === 2 ? 1 : 0.95,
                  y: activeFeature === 2 ? 0 : 20
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center p-20 overflow-hidden"
              >
                <div className="w-full max-w-4xl relative flex items-center justify-between z-10">
                  {/* Left Station (Client) */}
                  <motion.div
                    key="left-station"
                    animate={{ x: activeFeature === 2 ? 0 : -50, opacity: activeFeature === 2 ? 1 : 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="w-24 h-48 border backdrop-blur-xl relative flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                      <Users size={40} style={{ color: 'var(--text-secondary)', opacity: 0.2 }} strokeWidth={1} />
                      {/* Station Scanline */}
                      <motion.div
                        animate={{ y: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-accent/5 to-transparent"
                        style={{ backgroundImage: 'linear-gradient(to bottom, transparent, var(--accent), transparent)', opacity: 0.1 }}
                      />
                    </div>
                  </motion.div>

                  {/* The Grid Conduit */}
                  <div className="flex-1 h-64 relative flex flex-col justify-center items-center">
                    {/* Central Protocol Router */}
                    <motion.div
                      key="router"
                      animate={{
                        borderColor: activeFeature === 2 ? 'var(--accent)' : 'var(--border)',
                        boxShadow: activeFeature === 2 ? '0 0 20px rgba(96,10,10,0.2)' : '0 0 0px transparent'
                      }}
                      className="w-40 h-40 border bg-secondary backdrop-blur-3xl z-20 flex flex-col p-6 justify-around relative"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-1.5 w-full rounded-full overflow-hidden relative z-10" style={{ background: 'var(--border)' }}>
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            className="h-full w-12"
                            style={{ background: 'var(--accent)', opacity: 0.4 }}
                          />
                        </div>
                      ))}
                    </motion.div>

                    {/* Perfect Alignment Lines (Horizontal Conduit) */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 flex flex-col justify-between pointer-events-none px-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-full h-px relative" style={{ background: 'var(--border)' }}>
                          <motion.div
                            animate={{
                              x: activeFeature === 2 ? ['0%', '100%'] : '0%'
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="absolute top-0 w-2 h-full"
                            style={{ background: 'var(--accent)' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Station (Specialist) */}
                  <motion.div
                    key="right-station"
                    animate={{ x: activeFeature === 2 ? 0 : 50, opacity: activeFeature === 2 ? 1 : 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="w-24 h-48 border backdrop-blur-xl relative flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                      <Users size={40} style={{ color: 'var(--text-secondary)', opacity: 0.2 }} strokeWidth={1} />
                      <motion.div
                        animate={{ y: ['200%', '-100%'] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        className="absolute inset-x-0 h-10 bg-gradient-to-t from-transparent to-transparent"
                        style={{ backgroundImage: 'linear-gradient(to top, transparent, var(--accent), transparent)', opacity: 0.1 }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature 3 Overlay: Active Meritocracy (Unified Precision SVG) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: activeFeature === 3 ? 1 : 0,
                  scale: activeFeature === 3 ? 1 : 0.95,
                  y: activeFeature === 3 ? 0 : 20
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center p-10 overflow-hidden"
              >
                <div className="relative w-full aspect-video max-h-[500px]">
                  <svg viewBox="0 0 1000 500" className="w-full h-full z-30 pointer-events-none overflow-visible">
                    {/* Define Data Points for shared coordinate system */}
                    {/* [x, height] pairs */}
                    {[
                      [100, 120], [200, 180], [300, 140], [400, 280], [500, 220],
                      [600, 350], [700, 300], [800, 420], [900, 380], [980, 480]
                    ].map((point, i) => (
                      <g key={i}>
                        {/* Unified Bars (motion.rect) */}
                        <motion.rect
                          x={point[0] - 25}
                          width="50"
                          initial={{ height: 0, y: 500 }}
                          animate={{
                            height: activeFeature === 3 ? [0, 0, point[1], point[1], 0] : 0,
                            y: activeFeature === 3 ? [500, 500, 500 - point[1], 500 - point[1], 500] : 500,
                            fill: activeFeature === 3 ? ['transparent', 'transparent', 'var(--accent)', 'var(--accent)', 'transparent'] : 'transparent'
                          }}
                          transition={{
                            duration: 6,
                            times: [0, (i * 0.07), (i * 0.07) + 0.05, 0.85, 1],
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          stroke="var(--accent)"
                          strokeOpacity="0.2"
                          strokeWidth="1"
                          style={{ fillOpacity: 0.15 }}
                        />
                      </g>
                    ))}

                    <motion.path
                      animate={{
                        pathLength: activeFeature === 3 ? [0, 1, 1, 0] : 0,
                        opacity: activeFeature === 3 ? [0, 1, 1, 0] : 0
                      }}
                      transition={{
                        duration: 6,
                        times: [0, 0.7, 0.85, 1],
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      d="M 100 380 L 200 320 L 300 360 L 400 220 L 500 280 L 600 150 L 700 200 L 800 80 L 900 120 L 980 20"
                      fill="none" stroke="var(--accent)" strokeWidth="6"
                      style={{ filter: 'drop-shadow(var(--anim-shadow))' }}
                    />

                    {/* Synchronized Pulse Tracker */}
                    <motion.circle
                      r="12" fill="var(--accent)"
                      animate={{
                        offsetDistance: activeFeature === 3 ? ["0%", "100%", "100%", "0%"] : "0%",
                        opacity: activeFeature === 3 ? [0, 1, 1, 0] : 0
                      }}
                      transition={{
                        duration: 6,
                        times: [0, 0.7, 0.85, 1],
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        offsetPath: 'path("M 100 380 L 200 320 L 300 360 L 400 220 L 500 280 L 600 150 L 700 200 L 800 80 L 900 120 L 980 20")',
                        filter: 'drop-shadow(var(--anim-shadow))'
                      }}
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Feature 4 Overlay: Abstract Dashboard Architecture (No Text, Pure Geometry) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: activeFeature === 4 ? 1 : 0,
                  scale: activeFeature === 4 ? 1 : 0.95,
                  y: activeFeature === 4 ? 0 : 20
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 p-12 overflow-hidden flex items-center justify-center"
              >
                <div className="grid grid-cols-2 gap-10 w-full max-w-4xl relative z-10">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{
                        opacity: activeFeature === 4 ? 1 : 0,
                        scale: activeFeature === 4 ? 1 : 0.9,
                        y: activeFeature === 4 ? 0 : 30,
                        borderColor: activeFeature === 4 ? 'var(--accent)' : 'var(--border)',
                        boxShadow: activeFeature === 4 ? 'var(--anim-shadow)' : '0 0 0px transparent'
                      }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-video border rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between"
                      style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)' }}
                    >
                      {/* Abstract UI Elements */}
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-2 rounded-full" style={{ background: 'var(--border)' }}></div>
                        <div className="w-4 h-4 rounded-sm border" style={{ borderColor: 'var(--border)' }}></div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {[...Array(6)].map((_, j) => (
                            <motion.div
                              key={j}
                              animate={{ opacity: [0.1, 0.5, 0.1] }}
                              transition={{ duration: 1, delay: j * 0.1, repeat: Infinity }}
                              className="w-full h-8 border"
                              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
                            />
                          ))}
                        </div>
                        <div className="h-1 w-full relative overflow-hidden" style={{ background: 'var(--border)' }}>
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-20"
                            style={{ background: 'var(--accent)', opacity: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Moving Scanline Grid */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '100% 10px' }}></div>
                    </motion.div>
                  ))}

                  {/* Wired central mesh interconnects */}
                  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" style={{ stroke: 'var(--accent)' }} strokeWidth="1">
                    <circle cx="50%" cy="50%" r="40" fill="none" strokeDasharray="4 4" className="animate-spin-slow" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" strokeOpacity="0.2" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" strokeOpacity="0.2" />
                  </svg>
                </div>
              </motion.div>

              {/* Technical Blueprint Elements */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

              <div className="absolute left-10 bottom-10 flex flex-col gap-3">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className={`w-1 transition-all duration-700 rounded-full ${activeFeature === idx ? 'h-12 bg-white shadow-glow-sm' : 'h-3 bg-white/10'}`}></div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              {[
                {
                  tag: "Intelligence",
                  title: "Micro-Task Distribution Engine",
                  desc: "Projects are fragmented into precision-scoped tasks. AI-driven mastery tiers match each task to the right specialist â€” not just whoever is available.",
                  color: "from-accent to-forest"
                },
                {
                  tag: "Security",
                  title: "Wallet & Escrow Protection",
                  desc: "Funds lock into escrow when a project is posted. Released only after you formally approve the completed work. Neither side can lose without the other delivering.",
                  color: "from-forest to-accent"
                },
                {
                  tag: "Accountability",
                  title: "Human-Led Dispute Resolution",
                  desc: "Every dispute is handled by a trained Dispute Handler â€” not a chatbot. A structured meeting with all parties, inside Virtual's own built-in video meet window.",
                  color: "from-accent to-forest"
                },
                {
                  tag: "Meritocracy",
                  title: "Algorithmic Growth System",
                  desc: "Advancement is driven by data â€” accuracy, speed, and volume. When metrics cross a threshold, the system promotes automatically. No bias, no opinions.",
                  color: "from-forest to-accent"
                },
                {
                  tag: "Visibility",
                  title: "Live Command Dashboard",
                  desc: "See every micro-task in real time â€” in progress, under review, completed. Communicate directly with your Project Initiator without leaving the dashboard.",
                  color: "from-accent to-forest"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  onViewportEnter={() => setActiveFeature(i)}
                  viewport={{ amount: 0.5 }}
                  className="h-screen flex flex-col justify-center px-10 lg:px-24 relative"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl relative z-10"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.4em] mb-8 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--accent), var(--forest))` }}>
                      {item.tag}
                    </div>
                    <h3 className="text-4xl md:text-6xl font-bold mb-10 tracking-tighter leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                    <p className="text-xl md:text-2xl font-normal leading-relaxed opacity-90" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>

                    <div className="mt-12 flex items-center gap-4 group cursor-default" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                      <span className="text-sm font-bold uppercase tracking-widest">System Protocol {i + 1}</span>
                      <div className="h-px w-20 transition-all duration-500 overflow-hidden" style={{ background: 'var(--border)' }}>
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: activeFeature === i ? '100%' : '-100%' }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="h-full w-full"
                          style={{ background: 'var(--accent)' }}
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Vertical Progress Line Fragment */}
                  <div className="absolute left-6 h-1/2 w-px hidden lg:block" style={{ background: 'linear-gradient(to bottom, transparent, var(--border), transparent)' }}></div>
                </motion.div>
              ))}
            </div>
          </div>{/* end desktop flex */}
        </div>
      </section>


      {/* Apple-Style Floating Action Bar (Pill) */}
      <AnimatePresence>
        <FloatingPill splitProgress={splitProgress} navigate={navigate} logo={logo} isDark={isDark} />
      </AnimatePresence>

      {/* Final Call to Action */}
      <section className="py-20 sm:py-40 relative z-20 overflow-hidden border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
              Ready to build with
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>a real team behind you?</span>
            </h2>
            <p className="text-base sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto font-normal" style={{ color: 'var(--text-secondary)' }}>
              Post your project and get a structured department working on it â€” escrow-protected, supervisor-reviewed, and delivered on time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button onClick={() => navigate('/signup?role=client&redirect=/client/post-project')} className="btn-primary w-full sm:w-auto py-4 px-8 text-base font-bold tracking-wide">Post a Project</button>
              <button className="btn-ghost w-full sm:w-auto py-4 px-8 text-base font-bold tracking-wide">Contact Agency Team</button>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 flex justify-center items-center pointer-events-none">
          <div className="w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] opacity-[0.07] rounded-full blur-[80px] sm:blur-[120px] animate-pulse" style={{ background: 'var(--accent)' }} />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 sm:pt-32 pb-12 sm:pb-16 relative z-30 border-t" style={{ background: '#000000', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-16 mb-12 sm:mb-24">
            <div className="md:col-span-4">
              <div className="flex items-end mb-6 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src={logo} alt="V" className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
                    style={{ filter: isDark ? 'brightness(0) invert(1) sepia(1) saturate(0) brightness(1.1)' : 'invert(15%) sepia(80%) saturate(4000%) hue-rotate(250deg) brightness(30%) contrast(100%)' }} />
                </div>
                <span className="font-extrabold text-2xl" style={{ color: 'var(--text-primary)', letterSpacing: '-0.06em', marginLeft: '1px' }}>irtual</span>
              </div>
              <p className="font-normal text-sm leading-relaxed mb-6 max-w-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
                The elite architecture for the creative economy. Managed execution for world-class visions.
              </p>
              <div className="flex gap-3">
                {['T', 'L', 'I'].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}>
                    <span className="text-xs font-bold">{s}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
              {[
                { title: "Platform", links: ["Talent Directory", "Managed Services", "Pricing Structure"] },
                { title: "Resources", links: ["Escrow Protection", "Skill Tiers", "API Docs"] },
                { title: "Company", links: ["About Virtual", "Legal Framework", "Contact"] },
                { title: "Support", links: ["Dispute Center", "Help Articles", "System Status"] },
              ].map(col => (
                <div key={col.title} className="space-y-4">
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-primary)' }}>{col.title}</h4>
                  <div className="flex flex-col gap-3 text-sm">
                    {col.links.map(link => (
                      <a key={link} href="#" className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-30 text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>
              &copy; {new Date().getFullYear()} Virtual Inc. Defined by Excellence.
            </div>
            <div className="flex gap-6 text-[10px] font-medium uppercase tracking-[0.2em] opacity-30" style={{ color: 'var(--text-primary)' }}>
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
