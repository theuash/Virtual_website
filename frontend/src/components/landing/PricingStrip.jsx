import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingDown } from 'lucide-react';
import { getPricingSummary } from '../../services/pricing';
import { useCurrency } from '../../context/CurrencyContext';

const FIRST_PROJECT_DISCOUNT = 0.15;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  })
};

// Same two-phase pop  expand animation as the floating pill
function ExpandingCTA({ onClick }) {
  const [expanded, setExpanded] = useState(false);
  const [popped, setPopped] = useState(false);
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
        border: '1px solid var(--accent)',
        background: 'rgba(96,10,10,0.05)',
      }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={popped ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.7 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Icon dot - always visible anchor */}
      <span className="flex items-center justify-center pl-4 pr-3 py-3.5">
        <ArrowRight size={15} style={{ color: 'var(--accent)' }} />
      </span>

      {/* Text - expands in after pop */}
      <motion.span
        className="text-sm font-bold whitespace-nowrap overflow-hidden pr-6"
        style={{ color: 'var(--accent)' }}
        initial={{ width: 0, opacity: 0 }}
        animate={expanded ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{
          width: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.25, delay: 0.2 },
        }}
      >
        Explore full pricing
      </motion.span>
    </motion.button>
  );
}

export default function PricingStrip() {
  const navigate = useNavigate();
  const { convert } = useCurrency();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPricingSummary()
      .then(res => setDepartments(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const discounted = (rate) => Math.round(rate * (1 - FIRST_PROJECT_DISCOUNT));

  return (
    <section
      id="stats"
      className="pt-8 pb-12 px-6 relative z-20 border-t"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'var(--accent)', opacity: 0.04 }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-full mb-4"
            style={{ color: 'var(--accent)', borderColor: 'rgba(var(--accent-rgb), 0.3)', background: 'rgba(var(--accent-rgb), 0.08)' }}
          >
            <Zap size={13} />
            Transparent Pricing
          </div>
          <h2
            className="text-5xl md:text-6xl font-bold tracking-tighter mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Per-unit. No surprises.
          </h2>
          <p
            className="text-base max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every service priced by the unit - per minute, per second, per design. You pay for exactly what you get.
          </p>
        </motion.div>

        {loading ? (
          <div className="border rounded-[2.2rem] p-2 bg-white/[0.02] shadow-[0_0_20px_rgba(0,0,0,0.3)]" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex gap-4 overflow-x-auto py-2 hide-scrollbar snap-x snap-mandatory px-2 rounded-[1.8rem] border border-white/5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="h-[280px] w-[220px] sm:w-[240px] shrink-0 rounded-[1.5rem] snap-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="w-full h-full animate-pulse bg-white/5 rounded-[1.5rem]" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-[2.5rem] p-3 shadow-xl" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="flex gap-4 overflow-x-auto py-2 hide-scrollbar snap-x snap-mandatory px-2 rounded-[2rem] border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
            {departments.map((dept, i) => {
              const discountedPrice = discounted(dept.startingFrom);
              const savings = dept.startingFrom - discountedPrice;
              const convertedNormal = convert(dept.startingFrom);
              const convertedDiscounted = convert(discountedPrice);
              const convertedSavings = convertedNormal.value - convertedDiscounted.value;
              
              return (
                <motion.button
                  key={dept.department}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  onClick={() => navigate(`/pricing#${dept.department}`)}
                  className="group relative overflow-hidden rounded-[1.5rem] border p-6 flex flex-col justify-between h-[280px] w-[220px] sm:w-[240px] shrink-0 snap-center text-left transition-all duration-500"
                  style={{
                    background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 20px 40px -10px rgba(110,44,242,0.25)',
                    borderColor: 'rgba(110,44,242,0.5)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% -20%, var(--accent) 0%, transparent 70%)' }} />
                  
                  {/* Top accent line on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-center"
                    style={{ background: 'var(--accent)' }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-4 break-words leading-tight"
                      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                    >
                      {dept.displayName}
                    </div>

                    {/* Starting from label */}
                    <div className="text-[9px] font-bold mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                      STARTING FROM
                    </div>

                    {/* Discounted Price - Smaller responsive sizing */}
                    <div className="mb-2">
                      <div className="flex items-baseline flex-wrap gap-1">
                        <span
                          className="text-2xl sm:text-3xl font-black tracking-tight"
                          style={{ color: 'var(--accent)' }}
                        >
                          {convertedDiscounted.symbol}{convertedDiscounted.value}
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          /{dept.startingUnit}
                        </span>
                      </div>
                    </div>

                    {/* Original Price - smaller, strikethrough */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs line-through opacity-40"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {convertedNormal.symbol}{convertedNormal.value}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}
                      >
                        -{convertedNormal.symbol}{convertedSavings}
                      </span>
                    </div>

                    {/* First project badge */}
                    <div
                      className="flex items-center gap-1.5 text-[9px] font-bold"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Sparkles size={11} />
                      First project offer
                    </div>
                    {/* Minimal Arrow */}
                    <div className="flex justify-end mt-auto pt-4">
                      <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        )}

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          custom={6}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <ExpandingCTA onClick={() => navigate('/pricing')} />
        </motion.div>
      </div>
    </section>
  );
}
