import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Header from '../../components/landing/Header';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />
      {/* Desktop view with floating border */}
      <div className="hidden sm:block pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="space-y-24">
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
            The Process
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-5" style={{ color: 'var(--text-primary)' }}>
            Deconstructing Projects,<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>
              Constructing Careers
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We transform intimidating, complex projects into achievable, paid micro-tasks that build both skills and income simultaneously.
          </p>
        </motion.div>

        {/* Core Platform - How the platform works */}
        <div id="core-platform">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>
              Core Platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              How the platform works
            </h2>
            <p className="text-base opacity-70 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Three core mechanics power everything on Virtual - from the moment a project is posted to the moment it's delivered.
            </p>
          </motion.div>
          <div className="space-y-0 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {[
              {
                tag: 'Micro-Task Distribution',
                title: 'Every project is broken down, not handed off whole.',
                desc: "Virtual's Project Initiators fragment every incoming project into precision-scoped micro-tasks. Each task is sized and defined based on the skill it requires, the complexity it carries, and the tier of specialist best suited to execute it. Work is matched to specialists through AI-driven mastery tiers - the system knows who is ready for what, and assigns accordingly.",
              },
              {
                tag: 'Algorithmic Growth',
                title: 'Advancement is earned, not given.',
                desc: 'Growth on Virtual is triggered entirely by performance data. The algorithm tracks three variables that cannot be faked: accuracy of deliverables, speed of completion, and volume of work processed. When a freelancer\'s data crosses a promotion threshold, the system flags them automatically. No subjective bias. Your ascent is a direct reflection of your output.',
              },
              {
                tag: 'Live Command Dashboard',
                title: 'You always know exactly where your project stands.',
                desc: 'Clients have access to a command center that gives total transparency over every project in real time. The dashboard displays the full micro-task breakdown - which tasks are in progress, under review, and completed - live, as it happens. Clients can communicate directly with their assigned Project Initiator from inside the dashboard.',
              },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-6 p-8 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{item.tag}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                  <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 4-step flow */}
        <div id="how-a-project-works">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-2xl font-bold tracking-tight mb-10 text-center" style={{ color: 'var(--text-primary)' }}>
            How a Project Becomes a Career
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Large Project Arrives', desc: 'A complex creative assignment - video editing, design, animation - lands on the platform from a verified client with escrow-protected payment.' },
              { num: '02', title: 'Strategic Splitting', desc: 'A Project Initiator intelligently fragments it into precision-scoped micro-tasks: Cutting, Color Grading, SFX & Music, and more - each sized for a specific skill level.' },
              { num: '03', title: 'Distributed Learning', desc: 'Each micro-task is matched to skilled learners (Crates) based on their tier, skill level, and learning goals - ensuring optimal fit and real growth.' },
              { num: '04', title: 'Quality Delivery', desc: 'A Momentum Supervisor reviews every deliverable before it reaches the client. Final integration, seamless delivery, and payment released from escrow.' },
            ].map((step, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="relative p-6 rounded-2xl border group hover:border-accent transition-all duration-300"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="text-5xl font-black mb-4 opacity-10 select-none" style={{ color: 'var(--accent)' }}>{step.num}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight size={16} style={{ color: 'var(--accent)', opacity: 0.5 }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Problem / Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="p-8 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#ef4444' }}>The Freelance Gap</h3>
            <ul className="space-y-5">
              {[
                { bold: '"No experience, no job"', rest: ' - a barrier that locks newcomers out of opportunities entirely.' },
                { bold: 'Large projects overwhelm beginners', rest: ' who lack the skills to break them down into manageable work.' },
                { bold: 'Traditional learning is theoretical and unpaid', rest: ', creating financial barriers to skill development.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#ef4444' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="p-8 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#10b981' }}>The Virtual Solution</h3>
            <ul className="space-y-5">
              {[
                { bold: 'Democratize Access:', rest: ' Break complex projects into learnable, manageable micro-tasks anyone can start with.' },
                { bold: 'Guided Growth:', rest: ' Structured mentorship with a clear, progressive career path from day one.' },
                { bold: 'Earn from Day One:', rest: ' Monetize the learning process itself - get paid while you develop real, portfolio-grade skills.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Path to mastery timeline */}
        <div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              Your Path to Mastery, Mapped Out
            </h2>
            <p className="text-base opacity-60 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              A clear, merit-based progression from learner to strategist.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {[
              { num: 1, title: 'Sign Up', desc: 'Provide basic info (Name, Email, DOB 16+) and choose your primary skill - Video Editor, Graphic Designer, Writer, and more.' },
              { num: 2, title: 'Start as Precrate', desc: 'Complete curated learning modules and get verified by experienced mentors to ensure foundational competency.' },
              { num: 3, title: 'Become a Crate', desc: 'Get matched with a Project Initiator who guides your work. Start earning immediately on micro-tasks aligned with your skills.' },
              { num: 4, title: 'Promote to Project Initiator', desc: 'Hit specific milestones - projects completed, earnings thresholds. Get highlighted for promotion by your Supervisor.' },
              { num: 5, title: 'Ascend to Momentum Supervisor', desc: 'Excel in team leadership and project delivery. Undergo Admin vetting via online interview to join the strategic tier.' },
            ].map((step, i, arr) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="flex gap-5">
                {/* Left: number + line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    {step.num}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 mt-2" style={{ background: 'var(--border)', minHeight: '2rem' }} />
                  )}
                </div>
                {/* Right: content */}
                <div className="pb-10">
                  <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</p>
                  <p className="text-sm opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engine features */}
        <div id="engine-behind-growth">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-center mb-10" style={{ color: 'var(--text-primary)' }}>
            The Engine Behind the Growth
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Smart Task Distribution', desc: 'Project Initiators intelligently split and assign work based on Crate skill levels, availability, and learning goals - ensuring optimal matching.' },
              { title: 'Integrated Payment & Tracking', desc: 'Seamless payment gateway with transparent tracking for every micro-task. Escrow protection ensures fair compensation and trust for all parties.' },
              { title: 'Realtime Notification Hub', desc: 'Instant alerts for new task assignments, approvals, team messages, and promotion eligibility - keeping everyone connected and informed.' },
              { title: 'Performance Analytics Dashboard', desc: 'Users track progress, earnings, task completion rates, and promotion eligibility in real-time with intuitive visual dashboards.' },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="p-6 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center py-12 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to start earning while you learn?</h3>
          <p className="text-sm opacity-60 mb-6" style={{ color: 'var(--text-secondary)' }}>Join Virtual and get paid from day one.</p>
          <button onClick={() => navigate('/signup')}
            className="btn-primary px-8 py-3 text-sm font-bold">
            Get Started Free
          </button>
        </motion.div>

          </div>
        </div>
      </div>

      {/* Mobile view without floating border */}
      <div className="sm:hidden pt-28 pb-24 max-w-6xl mx-auto px-4 space-y-24">
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
            The Process
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-5" style={{ color: 'var(--text-primary)' }}>
            Deconstructing Projects,<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--forest))' }}>
              Constructing Careers
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-70 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We transform intimidating, complex projects into achievable, paid micro-tasks that build both skills and income simultaneously.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

