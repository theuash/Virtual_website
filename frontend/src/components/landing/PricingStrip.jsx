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
            style={{ color: 'var(--accent)', borderColor: 'rgba(96,10,10,0.3)', background: 'rgba(96,10,10,0.08)' }}
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

        {/* Department cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="h-56 rounded-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  className="group relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between h-full"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                  }}
                  whileHover={{ y: -4, borderColor: 'var(--accent)' }}
                >
                  {/* Top accent line on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4"
                      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                    >
                      {dept.displayName}
                    </div>

                    {/* Starting from label */}
                    <div className="text-[9px] font-bold mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                      STARTING FROM
                    </div>

                    {/* Discounted Price - LARGER */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-5xl font-black tracking-tight"
                          style={{ color: 'var(--accent)' }}
                        >
                          {convertedDiscounted.symbol}{convertedDiscounted.value}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          /{dept.startingUnit}
                        </span>
                      </div>
                    </div>

                    {/* Original Price - smaller, strikethrough */}
                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className="text-sm line-through opacity-40"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {convertedNormal.symbol}{convertedNormal.value}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ background: 'rgba(96,10,10,0.1)', color: 'var(--accent)' }}
                      >
                        Save {convertedNormal.symbol}{convertedSavings}
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
                  </div>

                  {/* Arrow indicator */}
                  <div className="relative z-10 mt-6 flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>
                      View all
                    </span>
                    <ArrowRight
                      size={16}
                      className="opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                </motion.button>
              );
            })}
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
