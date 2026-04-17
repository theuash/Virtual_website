import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useSpring, useVelocity } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Video, Cuboid, MonitorPlay, PenTool, Layout, ChevronRight, Volume2, VolumeX,
  Target, ShieldCheck, Zap, Users, Landmark, FileText, Bot, CreditCard, Scale, Bell, BarChart3, TrendingUp
} from 'lucide-react';
import Header from '../../components/landing/Header';
import bgVideo from '../../assets/v.mp4';
import logo from '../../assets/logo.png';

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

export default function LandingPage() {
  const navigate = useNavigate();
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

  const leftY = useTransform(splitProgress, [0, 1], [50, -150]);
  const rightY = useTransform(splitProgress, [0, 1], [-100, 100]);
  
  // Music Volume: Constant until section enters, then fades out by 20% into the section view
  const musicVolume = useTransform(splitProgress, [0, 0.2], [1, 0]);

  // Start video and keep it playing
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Safe start
        videoRef.current.muted = true;
        videoRef.current.play();
      });
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

      {/* Hero Section (Sticky Parallax) - Reduced height for better scroll tempo */}
      <section className="relative z-10" style={{ height: 'calc(100vh + 800px)' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-20">
          {/* Background Video Container - Anchored to black to prevent bleed */}
          <div className="absolute inset-0 z-0 bg-[#000000] cursor-pointer" onClick={toggleMute}>
            <video
              ref={videoRef}
              src={bgVideo}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover pointer-events-none"
              style={{
                opacity: videoOpacity,
                filter: 'brightness(1) contrast(1.1)'
              }}
            ></video>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #000000 0%, transparent 10%, transparent 90%, #000000 100%)', zIndex: 0 }}></div>
            {/* Text-legibility overlay — darkens in dark mode, lightens in light mode as text arrives */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: heroOpacity,
                background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.45)',
                zIndex: 1,
              }}
            />
          </div>

          <button
            onClick={toggleMute}
            className="absolute bottom-10 right-10 z-50 w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-black/60 hover:scale-110"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <AnimatePresence>
            {showScrollCue && (
              <motion.button
                type="button"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.35, ease: 'easeOut' } }}
                className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2 text-white/75 transition-all hover:text-white"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Scroll Down</span>
                  <motion.div
                    animate={{ y: [0, 6, 0], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20"
                  >
                    <ChevronRight size={18} className="rotate-90" />
                  </motion.div>
                  <div className="h-8 w-px bg-gradient-to-b from-white/60 to-transparent"></div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Full Screen Blur Overlay - Linked to Hero Appearance */}
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 z-10 backdrop-blur-xl pointer-events-none"
          />

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroTextY }}
            className="z-50 flex flex-col items-center max-w-4xl mx-auto mt-10 p-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest border rounded-full" style={{ color: 'var(--accent)', borderColor: 'rgba(96,10,10,0.2)', background: 'rgba(96,10,10,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ backgroundColor: 'var(--accent)' }}></span>
              The New Standard
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-center mb-6 leading-[1.08] text-white drop-shadow-2xl">
              The team you never
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #ffffff 0%, var(--accent) 100%)' }}
              >
                had to build.
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium tracking-wide leading-relaxed text-white/90">
              A fully departmentalized creative platform. Structured teams, escrow-protected payments, and a professional chain of command behind every project.
            </p>
            <button
              className="py-3.5 px-9 text-sm font-bold tracking-widest flex items-center gap-2 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: '#FFFFFF', 
                color: 'var(--accent)',
                boxShadow: '0 0 40px rgba(255,255,255,0.4)',
                border: 'none'
              }}
              onClick={() => navigate('/signup?role=client')}
            >
              Hire Elite Talent <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
        {/* The Trans-Theme Bridge: Bridging Black video section to themed content below */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[800px] pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)'
          }}
        ></div>
      </section>

      {/* Split Parallax (The Difference) */}
      <section ref={splitRef} className="py-40 relative z-20 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
          <motion.div style={{ y: leftY }} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
              Not a freelance platform. A structured creative agency.
            </h2>
            <p className="font-normal leading-relaxed text-lg mb-8 opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Every category operates as its own department with a designated head — personally accountable for every deliverable. You get a professional chain of command, not a random freelancer.
            </p>
            <ul className="space-y-6">
              {[
                "Structured execution — defined chain of command",
                "Quality assurance — Momentum Supervisor reviews every deliverable",
                "On-time delivery — timelines tracked live, delays flagged internally"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={24} style={{ color: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div style={{ y: rightY, perspective: 1200 }} className="relative h-[600px] w-full hidden md:block flex items-center justify-center overflow-visible">
            {/* Deep-Space 3D Parallax Matrix */}
            <motion.div 
              style={{ rotateX: 20, rotateY: -10, transformStyle: 'preserve-3d' }}
              animate={{ 
                rotateX: [20, 25, 20],
                rotateY: [-10, -15, -10]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
               {/* Layer 1: Far Perspective (Dim) */}
               <div className="absolute inset-0" style={{ transform: 'translateZ(-200px)', opacity: 0.1 }}>
                  <MeshGrid speed={15} count={4} />
               </div>

               {/* Layer 2: Mid Perspective (Active) */}
               <div className="absolute inset-0" style={{ transform: 'translateZ(0px)', opacity: 0.3 }}>
                  <MeshGrid speed={10} count={6} />
               </div>

               {/* Layer 3: Near Perspective (Glow) */}
               <div className="absolute inset-0" style={{ transform: 'translateZ(200px)', opacity: 0.15 }}>
                  <MeshGrid speed={6} count={3} />
               </div>

               {/* 3D Stage Text Layer */}
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ transform: 'translateZ(100px)' }}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-30" style={{ color: 'var(--text-primary)' }}>System Protocol</div>
                    <div className="text-5xl md:text-7xl font-black uppercase tracking-tighter mix-blend-difference" style={{ color: 'var(--text-primary)' }}>
                       <AnimatePresence mode="wait">
                          <motion.span
                             key={Math.floor(Date.now() / 3000) % 3}
                             initial={{ z: -50, opacity: 0 }}
                             animate={{ z: 0, opacity: 1 }}
                             exit={{ z: 50, opacity: 0 }}
                             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                             className="block"
                          >
                             {["Vetting", "Escrow", "Copyright"][Math.floor(Date.now() / 3000) % 3]}
                          </motion.span>
                       </AnimatePresence>
                    </div>
                    {/* 3D Scanning Line */}
                    <motion.div 
                       animate={{ top: ['-20%', '120%'], opacity: [0, 1, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="absolute left-0 right-0 h-px bg-accent z-20"
                       style={{ background: 'linear-gradient(to right, transparent, var(--accent), transparent)', boxShadow: '0 0 20px var(--accent)' }}
                    />
                  </motion.div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Core Engine (Sticky Parallax Showcase) */}
      <section className="relative lg:py-0 z-20" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left side: Immersive Full-Screen Graphics */}
            <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              {/* Light Mode Depth Textures */}
              <div className="light-texture"></div>
              <div className="light-vignette"></div>
              
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
                    <path d="M 0 50% L 100% 50%" strokeOpacity="0.2" />
                    <path d="M 50% 0 L 50% 100%" strokeOpacity="0.2" />
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
                  desc: "Projects are fragmented into precision-scoped tasks. AI-driven mastery tiers match each task to the right specialist — not just whoever is available.",
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
                  desc: "Every dispute is handled by a trained Dispute Handler — not a chatbot. A structured meeting with all parties, inside Virtual's own built-in video meet window.",
                  color: "from-accent to-forest"
                },
                {
                  tag: "Meritocracy",
                  title: "Algorithmic Growth System",
                  desc: "Advancement is driven by data — accuracy, speed, and volume. When metrics cross a threshold, the system promotes automatically. No bias, no opinions.",
                  color: "from-forest to-accent"
                },
                {
                  tag: "Visibility",
                  title: "Live Command Dashboard",
                  desc: "See every micro-task in real time — in progress, under review, completed. Communicate directly with your Project Initiator without leaving the dashboard.",
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
          </div>
        </div>
      </section>

      {/* Mastery in Action (Horizontal Scroll Overhaul) */}
      <section id="roles" ref={masteryRef} className="relative z-20" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          {/* Horizontal Slide Container */}
          <motion.div 
            style={{ x: masteryX }} 
            className="flex px-[10vw] gap-[5vw] items-center"
          >
            {/* Introductory Title Card */}
            <div className="flex-shrink-0 w-[40vw] mr-[5vw]">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-none" style={{ color: 'var(--text-primary)' }}>
                Mastery in <br /> 
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>Action.</span>
              </h2>
              <p className="text-xl max-w-md opacity-70 leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
                Five independent departments. Each with a designated head, a structured team, and full accountability for every deliverable.
              </p>
              <div className="mt-12 flex items-center gap-4">
                <div className="w-12 h-px bg-accent" style={{ background: 'var(--accent)' }}></div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Scroll to Explore</span>
              </div>
            </div>

            {/* Segment Cards */}
            {[
              { 
                icon: <Video size={32} />, 
                title: "Video Editing", 
                desc: "A dedicated department managing every cut, grade, and sequence — with a department head accountable for every frame delivered.",
                details: ["Cinematic Cuts", "Color Grading", "Motion Titles", "Commercial Edits"]
              },
              { 
                icon: <Cuboid size={32} />, 
                title: "3D Animation", 
                desc: "From character rigging to architectural visualization — structured, reviewed, and delivered by a team with a clear chain of command.",
                details: ["Character Rigging", "Environment Design", "Product Renders", "VFX Integration"]
              },
              { 
                icon: <MonitorPlay size={32} />, 
                title: "CGI & VFX", 
                desc: "Cinematic visual effects handled by a dedicated department. Every composite and simulation passes through supervisor review before delivery.",
                details: ["Green Screen", "Compositing", "Fluid Sims", "3D Projection"]
              },
              { 
                icon: <PenTool size={32} />, 
                title: "Script Writing", 
                desc: "Narratives and structural frameworks built by a writing department — not a solo freelancer. Department-reviewed before it reaches you.",
                details: ["Storyboarding", "Brand Voice", "Concept Dev", "Ad Copy"]
              },
              { 
                icon: <Layout size={32} />, 
                title: "Graphic Design", 
                desc: "Brand identity, design systems, and visual assets — managed by a full design department with a head overseeing every output.",
                details: ["UI Architecture", "Design Systems", "Brand Manuals", "Asset Libraries"]
              }
            ].map((role, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[60vw] md:w-[28vw] aspect-[5/6] border rounded-[2rem] p-8 flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02]" 
                style={{ 
                  background: 'var(--bg-glass)', 
                  borderColor: 'var(--border)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: 'var(--anim-shadow)'
                }}
              >
                <div>
                   <div 
                     className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" 
                     style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                   >
                     {role.icon}
                   </div>
                   <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>{role.title}</h3>
                   <p className="text-base opacity-70 font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{role.desc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                   {role.details.map((detail, dIdx) => (
                     <div key={dIdx} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent" style={{ background: 'var(--accent)' }}></div>
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--text-primary)' }}>{detail}</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Apple-Style Floating Action Bar (Pill) */}
      <AnimatePresence>
        <motion.div
           style={{ 
             opacity: useTransform(splitProgress, [0.05, 0.15], [0, 1]),
             y: useTransform(splitProgress, [0.05, 0.15], [20, 0]),
             x: '-50%'
           }}
           className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
           <div
             className="flex items-center gap-4 px-4 py-2.5 rounded-full"
             style={{
               background: 'rgba(10, 10, 10, 0.55)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               border: '1px solid rgba(255,255,255,0.08)',
               boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px rgba(255,255,255,0.07), 0 0 40px rgba(100,120,255,0.08)',
             }}
           >
              <div className="flex items-center">
                 <div className="w-5 h-5 flex items-center justify-center"
                   style={{ filter: 'drop-shadow(0 0 6px rgba(180,190,255,0.5))' }}
                 >
                    <img src={logo} alt="V" className="w-full h-full object-contain" style={{ filter: 'invert(100%) brightness(200%)' }} />
                 </div>
              </div>

              <div className="w-px h-3.5 bg-white/10"></div>

              <div className="hidden sm:flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-white/40">
                 <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white/70 transition-colors">Overview</button>
                 <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white/70 transition-colors">Specs</button>
              </div>

              <div className="w-px h-3.5 bg-white/10 hidden sm:block"></div>

              <button 
                onClick={() => navigate('/signup?role=client')}
                className="py-1.5 px-4 text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }}
              >
                Hire Elite Talent
              </button>
           </div>
        </motion.div>
      </AnimatePresence>

      {/* Final Call to Action */}
      <section className="py-40 relative z-20 overflow-hidden border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8" style={{ color: 'var(--text-primary)' }}>
              Ready to build with
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>a real team behind you?</span>
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto font-normal" style={{ color: 'var(--text-secondary)' }}>
              Post your project and get a structured department working on it — escrow-protected, supervisor-reviewed, and delivered on time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="btn-primary py-4 px-10 text-base font-bold tracking-wide">Post a Project</button>
              <button className="btn-ghost py-4 px-10 text-base font-bold tracking-wide">Contact Agency Team</button>
            </div>
          </motion.div>
        </div>
        {/* Animated Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 flex justify-center items-center">
          <div className="w-[800px] h-[400px] opacity-[0.07] rounded-full blur-[120px] animate-pulse" style={{ background: 'var(--accent)' }}></div>
        </div>
      </section>

      {/* Footer (Apple-Inspired Premium Overhaul) */}
      <footer className="pt-32 pb-16 relative z-30 border-t" style={{ background: '#000000', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-4">
              {/* Logo - Exact Match to Header */}
              <div
                className="flex items-center gap-3 mb-8 cursor-pointer group"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-11 h-11 flex items-center justify-center">
                  <img 
                    src={logo} 
                    alt="Virtual Logo" 
                    className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" 
                    style={{
                      // Dynamic Violet Filter (Matching Header)
                      filter: 'invert(42%) sepia(90%) saturate(1600%) hue-rotate(230deg) brightness(90%) contrast(100%) drop-shadow(0 0 10px rgba(99,102,241,0.3))'
                    }} 
                  />
                </div>
                <span className="font-extrabold text-3xl tracking-tighter" style={{ color: 'var(--text-primary)', letterSpacing: '-0.06em', marginLeft: '-15px' }}>
                  irtual
                </span>
              </div>
              <p className="font-normal text-base leading-relaxed mb-8 max-w-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
                The elite architecture for the creative economy. Managed execution for world-class visions.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 hover:border-accent hover:text-accent" 
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}
                  >
                    <span className="text-xs font-bold uppercase tracking-tighter">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-12">
              {[
                {
                  title: "Platform",
                  links: ["Talent Directory", "Managed Services", "Pricing Structure"]
                },
                {
                  title: "Resources",
                  links: ["Escrow Protection", "Skill Tiers", "API Docs"]
                },
                {
                  title: "Company",
                  links: ["About Virtual", "Legal Framework", "Contact"]
                },
                {
                  title: "Support",
                  links: ["Dispute Center", "Help Articles", "System Status"]
                }
              ].map((column) => (
                <div key={column.title} className="space-y-6">
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-primary)' }}>{column.title}</h4>
                  <div className="flex flex-col gap-4 text-sm font-normal">
                    {column.links.map(link => (
                      <a 
                        key={link} 
                        href="#" 
                        className="transition-all duration-300 hover:text-white opacity-50 hover:opacity-100" 
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t flex flex-col sm:flex-row justify-between items-center gap-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-30" style={{ color: 'var(--text-primary)' }}>
              &copy; {new Date().getFullYear()} Virtual Inc. Defined by Excellence.
            </div>
            <div className="flex gap-8 text-[10px] font-medium uppercase tracking-[0.2em] opacity-30" style={{ color: 'var(--text-primary)' }}>
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
