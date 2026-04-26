import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/landing/Header';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

const TIERS = [
  {
    num: 1, tier: 'Precrate', role: 'The Learner', color: '#6b7280',
    desc: 'Your entry point into the Virtual ecosystem. Complete verification and foundational training to prove readiness.',
    trigger: 'Automatic upon successful completion of verification and foundational training modules.',
    details: ['Curated Learning Modules', 'Mentor Verification', 'Skill Assessment', 'Platform Orientation'],
  },
  {
    num: 2, tier: 'Crate', role: 'The Doer', color: '#3b82f6',
    desc: 'Execute micro-tasks under direct supervision while building real portfolio work. Get matched with a Project Initiator who guides your growth. Start earning immediately.',
    trigger: 'Complete [X] projects and earn [$Y] in total compensation. Highlighted to Momentum Supervisor for review.',
    details: ['Micro-Task Execution', 'Portfolio Building', 'Supervised Work', 'Immediate Earnings'],
  },
  {
    num: 3, tier: 'Project Initiator', role: 'The Leader', color: '#8b5cf6',
    desc: 'Manage Crates, strategically break down projects, and drive both team and personal goals. The bridge between clients and the talent pool.',
    trigger: 'Successfully deliver [A] main projects + [B] team projects + [C] personal projects. Highlighted to Admins.',
    details: ['Team Management', 'Project Fragmentation', 'Client Interaction', 'Strategic Planning'],
  },
  {
    num: 4, tier: 'Momentum Supervisor', role: 'The Strategist', color: '#f59e0b',
    desc: 'Oversee 5+ Project Initiators, ensure project flow, and maintain quality standards across all departments and deliverables.',
    trigger: 'Comprehensive online interview with Admin team after being highlighted by performance data.',
    details: ['Oversee 5+ Initiators', 'Quality Assurance', 'Department Strategy', 'Admin Vetting'],
  },
  {
    num: 5, tier: 'Admin', role: 'The Gatekeeper', color: '#ef4444',
    desc: 'Secure high-level projects and ensure platform integrity. The highest tier of trust, responsibility, and platform authority.',
    trigger: 'Selected by existing Admins based on demonstrated excellence and platform contribution.',
    details: ['Platform Integrity', 'High-Level Projects', 'Promotion Decisions', 'Strategic Oversight'],
  },
];

export default function RolesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />
      {/* Desktop view with floating border */}
      <div className="hidden sm:block pt-14 pb-8 px-4">
        <div className="max-w-5xl mx-auto rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="space-y-20">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            {/* Hero */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-full mb-6"
            style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            The Hierarchy
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-5" style={{ color: 'var(--text-primary)' }}>
            A Clear Ladder.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>
              A Supported Climb.
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Virtual provides a structured hierarchy where every role builds on the last - ensuring mentorship, accountability, and continuous growth at every level.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="space-y-6">
          {TIERS.map((item, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              id={item.tier.toLowerCase().replace(/\s+/g, '-')}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', borderLeft: `4px solid ${item.color}` }}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0"
                      style={{ background: item.color + '22', color: item.color }}>
                      {item.num}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.tier}</h2>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.details.map(d => (
                      <span key={d} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{ background: item.color + '18', color: item.color }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: item.color + '0d' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                  <p className="text-xs leading-relaxed" style={{ color: item.color }}>
                    <strong>Promotion Trigger:</strong> {item.trigger}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Growth is Earned, Not Given */}
        <div id="merit-based-promotion" className="space-y-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-full mb-6"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
              Promotion System
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              Growth is Earned, Not Given
            </h2>
            <p className="text-base opacity-70 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Virtual's promotion system is built on <strong style={{ color: 'var(--text-primary)' }}>objective milestones</strong> - not opinions, not relationships. Every promotion reflects genuine skill development and measurable platform contribution.
            </p>
          </motion.div>

          {/* 3 promotion paths */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01', from: 'Precrate', to: 'Crate', fromColor: '#6b7280', toColor: '#3b82f6',
                trigger: 'Automatic',
                desc: 'Triggered automatically upon successful completion of all verification steps and foundational training modules. No human decision required - the system promotes you.',
                metric: 'Complete all modules + pass mentor verification',
              },
              {
                num: '02', from: 'Crate', to: 'Project Initiator', fromColor: '#3b82f6', toColor: '#8b5cf6',
                trigger: 'Performance-Based',
                desc: 'Complete a defined number of projects and cross an earnings threshold. Your Momentum Supervisor reviews your track record and makes the promotion decision.',
                metric: 'Projects completed + earnings threshold reached',
              },
              {
                num: '03', from: 'Project Initiator', to: 'Momentum Supervisor', fromColor: '#8b5cf6', toColor: '#f59e0b',
                trigger: 'Interview-Based',
                desc: 'Deliver across all three project types - main, team, and personal. Highlighted to Admins, followed by a comprehensive online interview to assess leadership readiness.',
                metric: 'Multi-project delivery + Admin interview',
              },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                {/* Top bar gradient */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${item.fromColor}, ${item.toColor})` }} />
                <div className="p-6">
                  {/* Number + trigger badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-black opacity-10 select-none" style={{ color: item.toColor }}>{item.num}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                      style={{ background: item.toColor + '22', color: item.toColor }}>
                      {item.trigger}
                    </span>
                  </div>

                  {/* Tier transition arrow */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: item.fromColor + '22', color: item.fromColor }}>
                      {item.from}
                    </span>
                    <svg width="20" height="10" viewBox="0 0 20 10">
                      <path d="M0 5 L14 5 M10 1 L14 5 L10 9" stroke="var(--border)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: item.toColor + '22', color: item.toColor }}>
                      {item.to}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed mb-4 opacity-70" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>

                  {/* Metric pill */}
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: item.toColor + '0d' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: item.toColor }} />
                    <p className="text-xs font-semibold leading-relaxed" style={{ color: item.toColor }}>{item.metric}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key principle bar */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex items-start gap-4 p-6 rounded-2xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent)22', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Key Principle</p>
              <p className="text-sm opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Merit-based advancement with clear, measurable criteria ensures every promotion reflects genuine skill development and platform contribution. <strong style={{ color: 'var(--text-primary)' }}>No subjective bias. No favouritism. Your data speaks for itself.</strong>
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center">
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to start your climb?</h3>
          <p className="text-sm opacity-60 mb-6" style={{ color: 'var(--text-secondary)' }}>Join as a freelancer and begin your journey from Precrate today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup?role=freelancer')} className="btn-primary px-8 py-3 text-sm font-bold w-full sm:w-auto">
              Join as Freelancer
            </button>
            <button onClick={() => navigate('/how-it-works')}
              className="px-8 py-3 text-sm font-bold rounded-xl border w-full sm:w-auto transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              See How It Works
            </button>
          </div>
        </motion.div>

          </div>
        </div>
      </div>

      {/* Mobile view without floating border */}
      <div className="sm:hidden pt-28 pb-24 max-w-5xl mx-auto px-4 space-y-20">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Hero */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-full mb-6"
            style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            The Hierarchy
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-5" style={{ color: 'var(--text-primary)' }}>
            A Clear Ladder.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>
              A Supported Climb.
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Virtual provides a structured hierarchy where every role builds on the last - ensuring mentorship, accountability, and continuous growth at every level.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

