import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingDown } from 'lucide-react';
import { getPricingSummary } from '../../services/pricing';

const FIRST_PROJECT_DISCOUNT = 0.15;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
};

const shimmer = {
  hidden: { backgroundPosition: '200% center' },
  show: {
    backgroundPosition: '-200% center',
    transition: { duration: 2, repeat: Infinity, ease: 'linear' }
  }
};

export default function PricingStrip() {
  const navigate = useNavigate();
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
      className="py-48 px-6 relative z-20 border-t overflow-hidden"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-0 animate-pulse"
          style={{ background: 'var(--accent)', animation: 'pulse 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-0 animate-pulse"
          style={{ background: 'var(--accent)', animation: 'pulse 5s ease-in-out infinite 1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-full mb-8"
            style={{ color: 'var(--accent)', borderColor: 'rgba(96,10,10,0.3)', background: 'rgba(96,10,10,0.08)' }}
          >
            <Zap size={13} />
            Transparent Pricing
          </div>
          <h2
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Per-unit. No surprises.
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every service priced by the unit — per minute, per second, per design. You pay for exactly what you get. No hidden fees, no surprises.
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
                className="h-56 rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <motion.div
                  animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--bg-secondary) 0%, rgba(255,255,255,0.1) 50%, var(--bg-secondary) 100%)',
                    backgroundSize: '200% center',
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {departments.map((dept, i) => {
              const discountedPrice = discounted(dept.startingFrom);
              const savings = dept.startingFrom - discountedPrice;
              
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
                  whileHover={{ y: -6, borderColor: 'var(--accent)' }}
                >
                  {/* Premium gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(96,10,10,0.1) 0%, transparent 100%)',
                    }}
                  />

                  {/* Top accent line */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className="text-[11px] font-black uppercase tracking-[0.35em] mb-4"
                      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                    >
                      {dept.displayName}
                    </div>

                    {/* Starting from label - ABOVE price */}
                    <div className="text-[9px] font-bold mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                      STARTING FROM
                    </div>

                    {/* Original Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-5xl font-black tracking-tight"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ₹{dept.startingFrom}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          /{dept.startingUnit}
                        </span>
                      </div>
                    </div>

                    {/* Discount badge with animation */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(96,10,10,0.2), rgba(96,10,10,0.05))',
                        border: '1px solid rgba(96,10,10,0.3)',
                      }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20"
                        animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                          backgroundSize: '200% center',
                        }}
                      />

                      <TrendingDown size={13} style={{ color: 'var(--accent)' }} />
                      <div className="relative z-10">
                        <div className="text-[10px] font-black" style={{ color: 'var(--accent)' }}>
                          ₹{discountedPrice}/{dept.startingUnit}
                        </div>
                        <div className="text-[8px] font-bold" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                          Save ₹{savings} (15% off)
                        </div>
                      </div>
                    </motion.div>

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
                  <motion.div
                    className="relative z-10 mt-6 flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>
                      View all
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="group-hover:opacity-100 opacity-40 transition-opacity"
                    >
                      <ArrowRight
                        size={16}
                        style={{ color: 'var(--accent)' }}
                      />
                    </motion.div>
                  </motion.div>
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
          className="mt-16 flex justify-center"
        >
          <motion.button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-3 px-8 py-4 text-sm font-bold rounded-full border transition-all relative overflow-hidden group"
            style={{
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
              background: 'rgba(96,10,10,0.05)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover shimmer */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              animate={{ backgroundPosition: ['200% center', '-200% center'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                backgroundSize: '200% center',
              }}
            />
            <span className="relative z-10">Explore full pricing</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight size={16} />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
