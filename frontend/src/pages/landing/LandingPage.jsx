import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Video, Cuboid, MonitorPlay, PenTool, Layout, ChevronRight, Volume2, VolumeX,
  Target, ShieldCheck, Zap, Users, Landmark, FileText, Bot, CreditCard, Scale, Bell, BarChart3, TrendingUp
} from 'lucide-react';
import Header from '../../components/landing/Header';
import bgVideo from '../../assets/v.mp4';

export default function LandingPage() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  // Scroll tracking
  const { scrollY } = useScroll();

  // Hero Parallax
  // Text invisible initially, fades in smoothly from 200px to 600px
  const heroOpacity = useTransform(scrollY, [200, 600], [0, 1]);
  const heroScale = useTransform(scrollY, [200, 600], [0.95, 1]);
  const heroTextY = useTransform(scrollY, [200, 600], [20, 0]);

  // Video darken as we scroll deeper
  const videoOpacity = useTransform(scrollY, [800, 1500], [0.4, 0.15]);

  // Split-screen Parallax
  const splitRef = useRef(null);
  const { scrollYProgress: splitProgress } = useScroll({
    target: splitRef,
    offset: ["start end", "end start"]
  });

  const leftY = useTransform(splitProgress, [0, 1], [50, -150]);
  const rightY = useTransform(splitProgress, [0, 1], [-100, 100]);

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

  // Track active feature for side parallax
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div ref={containerRef} className="bg-base text-text-primary min-h-screen relative font-sans selection:bg-violet-bloom/30" style={{ fontFamily: '"Bahnschrift", "Segoe UI", sans-serif' }}>
      <Header />

      {/* Hero Section (Sticky Parallax) */}
      <section className="relative" style={{ height: 'calc(100vh + 1600px)' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0 bg-base cursor-pointer" onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            setShowUnmuteHint(false);
            if (videoRef.current) {
              videoRef.current.muted = newMuted;
              videoRef.current.play();
            }
          }}>
            <video
              ref={videoRef}
              src={bgVideo}
              autoPlay
              loop
              muted={true}
              playsInline
              className="w-full h-full object-cover mix-blend-screen pointer-events-none"
              style={{ opacity: videoOpacity }}
            ></video>
            <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-base pointer-events-none"></div>
          </div>

          <button
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              setShowUnmuteHint(false);
              if (videoRef.current) {
                videoRef.current.muted = newMuted;
                videoRef.current.play();
              }
            }}
            className={`absolute bottom-10 right-10 z-50 p-3 rounded-full border transition-all duration-500 backdrop-blur-md ${showUnmuteHint
              ? "bg-violet-bloom text-white border-white scale-110 shadow-glow-lg animate-bounce"
              : "border-glass-border bg-glass-card text-text-muted hover:text-white"
              }`}
            title={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={20} strokeWidth={1.5} /> : <Volume2 size={20} strokeWidth={1.5} />}
            {showUnmuteHint && (
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-violet-bloom text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-glow-sm">
                Click for Sound
              </span>
            )}
          </button>
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroTextY }}
            className="z-10 flex flex-col items-center max-w-4xl mx-auto mt-10"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-300 border border-violet-bloom/20 rounded-full bg-violet-900/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-light animate-pulse"></span>
              The New Standard
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-white mb-6 leading-tight">
              Where Talent Meets
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-300 to-electric-blue">
                Opportunity.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 font-light tracking-wide leading-relaxed">
              An elegant ecosystem for world-class creatives. Seamless workflows, transparent pricing, and unparalleled quality.
            </p>
            <button
              className="btn-primary py-3.5 px-8 text-sm font-medium tracking-wide shadow-glow-lg flex items-center gap-2"
              onClick={() => document.getElementById('header-get-started')?.click()}
            >
              Hire Elite Talent <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Split Parallax (The Difference) */}
      <section ref={splitRef} className="py-40 relative z-20 overflow-hidden bg-base">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
          <motion.div style={{ y: leftY }} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">
              A refined approach to creative scaling.
            </h2>
            <p className="text-text-muted font-light leading-relaxed text-lg mb-8">
              We eliminated the noise. No bidding wars. No unverified portfolios. Just an orchestrated pipeline where quality meets efficiency.
            </p>
            <ul className="space-y-6">
              {[
                "Strict algorithmic vetting",
                "Escrow-protected milestones",
                "Automated copyright handover"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-white text-sm font-light">
                  <CheckCircle size={20} className="text-electric-blue opacity-80" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div style={{ y: rightY }} className="relative h-[600px] w-full hidden md:block">
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-glass-border bg-gradient-to-tr from-violet-900/10 to-base backdrop-blur-3xl shadow-glow-lg flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-bloom/20 rounded-full blur-[80px]"></div>
              <div className="relative z-10 w-32 h-32 border border-violet-bloom/30 rounded-2xl bg-base flex flex-col items-center justify-center shadow-2xl">
                <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-electric-blue animate-spin mb-3"></div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted">Processing...</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Core Engine (Sticky Parallax Showcase) */}
      <section className="relative bg-base lg:py-0 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left side: Immersive Full-Screen Graphics */}
            <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0 overflow-hidden bg-base">
              {/* Feature 0 Overlay: Blocked Task Distribution (The Fragmentation Engine) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeFeature === 0 ? 1 : 0 }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                 <div className="relative w-full h-full p-20">
                    {/* The Fragmentation Engine */}
                    {activeFeature === 0 && (
                      <div className="absolute inset-x-20 inset-y-40">
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
                              className="group relative border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-sm overflow-hidden flex flex-col justify-between p-4"
                            >
                               {/* Animated Filling Bar */}
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: "100%" }}
                                 transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                                 className="absolute top-0 left-0 h-0.5 bg-violet-bloom/40"
                               ></motion.div>
                               
                               <div className="flex justify-between items-start">
                                  <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                                  <div className="w-1 h-1 rounded-full bg-violet-bloom"></div>
                               </div>
                               
                               <div className="space-y-1.5 mt-auto">
                                  <div className="w-full h-1 bg-white/5 rounded-full"></div>
                                  <div className="w-2/3 h-1 bg-white/5 rounded-full"></div>
                               </div>

                               {/* Hover Effect */}
                               <div className="absolute inset-0 bg-violet-bloom/0 group-hover:bg-violet-bloom/5 transition-colors"></div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Distribution Signal Lines */}
                        <svg className="absolute inset-[-40px] w-[calc(100%+80px)] h-[calc(100%+80px)] opacity-5 pointer-events-none">
                           {[...Array(6)].map((_, i) => (
                             <motion.line
                               key={i}
                               initial={{ pathLength: 0 }}
                               animate={{ pathLength: 1 }}
                               transition={{ duration: 2, repeat: Infinity }}
                               x1="0" y1={`${i * 20}%`}
                               x2="100%" y2={`${i * 20}%`}
                               stroke="white" 
                               strokeWidth={1}
                             />
                           ))}
                        </svg>
                      </div>
                    )}
                 </div>
              </motion.div>

              {/* Feature 1 Overlay: Sovereign Escrow (The Vault) - Kept as requested "second is good" */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeFeature === 1 ? 1 : 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1)_0%,_transparent_70%)]"></div>
                 {[...Array(5)].map((_, i) => (
                   <motion.div 
                      key={i}
                      animate={{ rotate: [0, 90], scale: [1, 1.2, 1] }}
                      transition={{ duration: 15, repeat: Infinity, delay: i * 1, ease: "linear" }}
                      className="absolute border border-cyan-400/20"
                      style={{ width: `${300 + i * 120}px`, height: `${300 + i * 120}px` }}
                   />
                 ))}
                 <div className="z-10 text-white opacity-10"><ShieldCheck size={400} strokeWidth={0.2} /></div>
              </motion.div>

              {/* Feature 2 Overlay: Managed Resolution (The Grid Protocol) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeFeature === 2 ? 1 : 0 }}
                className="absolute inset-0 flex items-center justify-center p-20 overflow-hidden"
              >
                 <div className="w-full max-w-4xl relative flex items-center justify-between">
                    {/* Left Station (Client) */}
                    <motion.div 
                      key="left-station"
                      animate={{ x: activeFeature === 2 ? 0 : -50, opacity: activeFeature === 2 ? 1 : 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                       <div className="w-24 h-48 border border-white/10 bg-white/[0.02] backdrop-blur-xl relative flex items-center justify-center overflow-hidden">
                          <Users size={48} className="text-white/20" strokeWidth={1} />
                          <div className="absolute top-0 left-0 w-1 h-full bg-white/5"></div>
                          <motion.div 
                            animate={{ height: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 w-[1px] bg-sky-400/40"
                          />
                       </div>
                       <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Initiator_Node</div>
                    </motion.div>

                    {/* The Grid Conduit */}
                    <div className="flex-1 h-48 relative flex flex-col justify-center items-center">
                       {/* The Central Protocol Router */}
                       <motion.div 
                         key="router"
                         animate={{ 
                            borderColor: activeFeature === 2 ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)',
                            scale: activeFeature === 2 ? [1, 1.05, 1] : 1
                         }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="w-32 h-32 border border-violet-bloom/40 bg-violet-900/5 backdrop-blur-3xl z-20 flex flex-col p-4 justify-around"
                       >
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                  className="h-full w-10 bg-violet-bloom/40"
                               />
                            </div>
                          ))}
                       </motion.div>

                       {/* Perfect Alignment Lines (Horizontal Conduit) */}
                       <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 flex flex-col justify-between pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-white/5 relative">
                               <motion.div 
                                  animate={{ 
                                     x: activeFeature === 2 ? ['0%', '100%'] : '0%' 
                                  }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                  className="absolute top-0 w-2 h-full bg-sky-400"
                               />
                               <motion.div 
                                  animate={{ 
                                     x: activeFeature === 2 ? ['100%', '0%'] : '100%' 
                                  }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                  className="absolute top-0 w-2 h-full bg-violet-bloom"
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
                       <div className="w-24 h-48 border border-white/10 bg-white/[0.02] backdrop-blur-xl relative flex items-center justify-center overflow-hidden">
                          <Users size={48} className="text-white/20" strokeWidth={1} />
                          <div className="absolute top-0 right-0 w-1 h-full bg-white/5"></div>
                          <motion.div 
                            animate={{ height: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                            className="absolute top-0 left-0 w-[1px] bg-violet-bloom/40"
                          />
                       </div>
                       <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Specialist_Node</div>
                    </motion.div>
                 </div>
              </motion.div>

              {/* Feature 3 Overlay: Active Meritocracy (Dynamic Waves) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeFeature === 3 ? 1 : 0 }}
                className="absolute inset-0 flex items-end justify-between px-10 gap-2"
              >
                 {[...Array(12)].map((_, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2">
                     <motion.div 
                        animate={{ 
                          height: activeFeature === 3 ? [200, 500, 300, 600, 400] : 0,
                          backgroundColor: i % 2 === 0 ? 'rgba(56,189,248,0.1)' : 'rgba(124,58,237,0.1)'
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                        className="w-full border-x border-white/5 relative overflow-hidden"
                     >
                        <motion.div 
                          animate={{ y: ['-100%', '300%'] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                          className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-sky-400/30 to-transparent"
                        />
                     </motion.div>
                     <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-glow-sm"></div>
                   </div>
                 ))}
                 <div className="absolute inset-0 flex items-center justify-center opacity-10"><TrendingUp size={600} strokeWidth={0.1} /></div>
              </motion.div>

              {/* Feature 4 Overlay: Real-time Dashboard Sequence */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeFeature === 4 ? 1 : 0 }}
                className="absolute inset-0 p-12 overflow-hidden"
              >
                 <div className="grid grid-cols-2 gap-8 h-full">
                    {/* Mini Charts/Windows */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: activeFeature === 4 ? 1 : 0, y: activeFeature === 4 ? 0 : 100 }}
                        transition={{ delay: i * 0.15 }}
                        className="border border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden"
                      >
                         <div className="h-1 w-20 bg-indigo-500/50 rounded-full mb-4"></div>
                         <div className="space-y-3">
                            <div className="h-2 w-full bg-white/5 rounded-full"></div>
                            <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
                         </div>
                         {/* Moving Scanline */}
                         <motion.div 
                           animate={{ y: [-100, 400] }}
                           transition={{ duration: 3, repeat: Infinity }}
                           className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-indigo-400/5 to-transparent -skew-y-12"
                         />
                      </motion.div>
                    ))}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"><Layout size={700} strokeWidth={0.05} /></div>
              </motion.div>

              {/* Technical Blueprint Elements */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
              
              <div className="absolute left-10 bottom-10 flex flex-col gap-3">
                 {[0,1,2,3,4].map(idx => (
                   <div key={idx} className={`w-1 transition-all duration-700 rounded-full ${activeFeature === idx ? 'h-12 bg-white shadow-glow-sm' : 'h-3 bg-white/10'}`}></div>
                 ))}
              </div>
            </div>

            {/* Right side: Scrolling Story */}
            <div className="w-full lg:w-1/2 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
              {[
                {
                  tag: "Intelligence",
                  title: "Micro-Task Distribution Engine",
                  desc: "Our proprietary engine fragments projects into precision-scoped tasks, matching work to specialists through AI-driven mastery tiers.",
                  color: "from-violet-400 to-purple-600"
                },
                {
                  tag: "Security",
                  title: "Sovereign Escrow Protection",
                  desc: "100% of project funds are secured at initiation. Our managed escrow releases capital only upon expert supervisor verification.",
                  color: "from-cyan-400 to-blue-600"
                },
                {
                  tag: "Accountability",
                  title: "Managed Resolution Protocol",
                  desc: "Eliminate friction with a documented resolution system. Every conflict is settled by internal human experts within 72 hours.",
                  color: "from-purple-400 to-indigo-600"
                },
                {
                  tag: "Meritocracy",
                  title: "Algorithmic Growth System",
                  desc: "Growth triggered by performance data. No subjective bias—only accuracy, speed, and volume define your ascent in the ecosystem.",
                  color: "from-sky-400 to-blue-500"
                },
                {
                  tag: "Visibility",
                  title: "Live Command Dashboard",
                  desc: "Total transparency through a singular command center. Track split-task progress and communicate with Initiators in real-time.",
                  color: "from-indigo-400 to-violet-500"
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
                    <div className={`text-xs font-bold uppercase tracking-[0.4em] mb-8 bg-clip-text text-transparent bg-gradient-to-r ${item.color}`}>
                      {item.tag}
                    </div>
                    <h3 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tighter leading-[1.1]">
                      {item.title}
                    </h3>
                    <p className="text-xl md:text-2xl text-text-muted font-normal leading-relaxed opacity-90">
                      {item.desc}
                    </p>
                    
                    <div className="mt-12 flex items-center gap-4 text-white/40 group cursor-default">
                       <span className="text-sm font-bold uppercase tracking-widest">System Protocol {i + 1}</span>
                       <div className="h-px w-20 bg-white/10 group-hover:bg-violet-bloom/50 transition-all duration-500 overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: activeFeature === i ? '100%' : '-100%' }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-full w-full bg-violet-bloom"
                          ></motion.div>
                       </div>
                    </div>
                  </motion.div>
                  
                  {/* Vertical Progress Line Fragment */}
                  <div className="absolute left-6 h-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Talents Segment (Consolidated) */}
      <section id="roles" className="py-24 bg-navy/50 relative z-20 border-y border-glass-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-white">Mastery in Action</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { icon: <Video size={24} />, title: "Motion" },
              { icon: <Cuboid size={24} />, title: "3D Animation" },
              { icon: <MonitorPlay size={24} />, title: "CGI Arts" },
              { icon: <PenTool size={24} />, title: "Strategy" },
              { icon: <Layout size={24} />, title: "Brand" }
            ].map((role, i) => (
              <div key={i} className="flex flex-col items-center gap-4 text-text-muted hover:text-white transition-colors cursor-default">
                <div className="w-12 h-12 rounded-full border border-white/5 bg-white/3 flex items-center justify-center">
                  {role.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{role.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 bg-base relative z-20 overflow-hidden border-t border-glass-border">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8">
              Ready to deploy your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-bloom to-electric-blue">Next Vision?</span>
            </h2>
            <p className="text-text-muted text-xl mb-12 max-w-2xl mx-auto font-normal">
              Stop browsing. Start building. Post your project today and experience managed creative service at its peak.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="btn-primary py-4 px-10 text-base font-bold tracking-wide">Post a Project</button>
              <button className="btn-ghost py-4 px-10 text-base font-bold tracking-wide border-white/10 text-white">Contact Agency Team</button>
            </div>
          </motion.div>
        </div>
        {/* Animated Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 flex justify-center items-center">
          <div className="w-[800px] h-[400px] bg-violet-bloom opacity-[0.07] rounded-full blur-[120px] animate-pulse"></div>
        </div>
      </section>

      {/* Footer (Premium Overhaul) */}
      <footer className="bg-base pt-24 pb-12 relative z-30 border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-bloom to-electric-blue flex items-center justify-center font-bold text-white text-lg shadow-glow-sm">V</div>
                <span className="font-bold text-2xl tracking-tighter text-white">Virtual</span>
              </div>
              <p className="text-text-muted font-normal text-base leading-relaxed mb-8 max-w-xs">
                The elite architecture for the creative economy. Managed execution for world-class visions.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full border border-white/5 bg-white/3 flex items-center justify-center text-text-muted hover:text-white hover:border-white/20 transition-all">{social[0]}</a>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                <div className="flex flex-col gap-4 text-sm text-text-muted font-normal">
                  <a href="#" className="hover:text-white transition-colors">Talent Directory</a>
                  <a href="#" className="hover:text-white transition-colors">Managed Services</a>
                  <a href="#" className="hover:text-white transition-colors">Pricing Structure</a>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Resources</h4>
                <div className="flex flex-col gap-4 text-sm text-text-muted font-normal">
                  <a href="#" className="hover:text-white transition-colors">Escrow Protection</a>
                  <a href="#" className="hover:text-white transition-colors">Skill Tiers</a>
                  <a href="#" className="hover:text-white transition-colors">API Docs</a>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Company</h4>
                <div className="flex flex-col gap-4 text-sm text-text-muted font-normal">
                  <a href="#" className="hover:text-white transition-colors">About Virtual</a>
                  <a href="#" className="hover:text-white transition-colors">Legal Framework</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Support</h4>
                <div className="flex flex-col gap-4 text-sm text-text-muted font-normal">
                  <a href="#" className="hover:text-white transition-colors">Dispute Center</a>
                  <a href="#" className="hover:text-white transition-colors">Help Articles</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-[11px] text-text-muted font-normal uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Virtual Inc. Powered by Managed Creative Pipelines.
            </div>
            <div className="flex gap-8 text-[11px] text-text-muted font-normal uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
