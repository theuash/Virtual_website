import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, ArrowRight, ChevronLeft } from 'lucide-react';
import Header from '../../components/landing/Header';
import { getAllPricing } from '../../services/pricing';

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
    transition: { duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }
  })
};

function ServiceBox({ item, index, showDiscount }) {
  const discounted = Math.round(item.rate * (1 - DISCOUNT));
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="group relative overflow-hidden rounded-xl border transition-all duration-300 p-5"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      whileHover={{ y: -3, borderColor: 'var(--accent)', boxShadow: '0 12px 24px rgba(96,10,10,0.1)' }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity pointer-events-none"
        style={{ background: 'linear-gradient(135deg, var(--accent), transparent)' }}
      />
      <div className="relative z-10">
        <div className="text-sm font-semibold mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
          {item.name}
        </div>
        {item.tolerance && (
          <div className="text-[10px] mb-3 opacity-50" style={{ color: 'var(--text-secondary)' }}>
            {item.tolerance}
          </div>
        )}
        <div className="flex items-baseline gap-1.5">
          {showDiscount ? (
            <div>
              <div className="text-xs line-through opacity-40" style={{ color: 'var(--text-secondary)' }}>
                ₹{item.rate}
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                ₹{discounted}
              </div>
              <div className="text-[9px] mt-1 flex items-center gap-1" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                <Sparkles size={8} /> 15% off
              </div>
            </div>
          ) : (
            <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              ₹{item.rate}
            </div>
          )}
          <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--text-secondary)' }}>
            /{item.unit}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [query, setQuery] = useState('');
  const [showDiscount, setShowDiscount] = useState(true);
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

      {/* ── Hero ─────────────────────────────────────────────── */}
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
            Every service is priced per unit of work — per minute, per second, per design. You pay for exactly what you get.
          </p>
        </motion.div>
      </section>

      {/* ── First Project Discount Banner ─────────────────── */}
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
                  Applied automatically at checkout — no code needed.
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

      {/* ── Search ───────────────────────────────────────────── */}
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
              placeholder="Search any service across all departments…"
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

      {/* ── Search Results ───────────────────────────────────── */}
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
                      <ServiceBox key={`${item.department}-${item.name}`} item={item} index={i} showDiscount={showDiscount} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky Tab Bar ───────────────────────────────────── */}
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

      {/* ── Department Sections ──────────────────────────────── */}
      {!query.trim() && (
        <div className="px-6 pb-32">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="py-32 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Loading pricing…
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
                          ₹{dept.startingFrom}/{dept.startingUnit}
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
                            <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} />
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
                          <ServiceBox key={item._id} item={item} index={i} showDiscount={showDiscount} />
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

      {/* ── CTA ──────────────────────────────────────────────── */}
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
            Your first project gets 15% off — applied automatically at checkout.
          </p>
          <button
            onClick={() => navigate('/signup?role=client')}
            className="btn-primary py-3.5 px-8 text-sm font-bold tracking-wide flex items-center gap-2 mx-auto"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
