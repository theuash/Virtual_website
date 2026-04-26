import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, ArrowRight, ShieldCheck, Users, MonitorPlay, Scale, ChevronLeft, ArrowLeft
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function AboutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.hash]);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <Header />

      {/* Back Button */}
      <div className="flex items-center gap-3 pt-28 pb-4 px-4">
        <motion.button
          onClick={() => navigate("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-48 pb-32 px-6 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.05 }}
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
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
              About Virtual
            </div>
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            A creative platform built on
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(to bottom right, var(--text-primary), var(--accent))' }}
            >
              structure, not chance.
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Virtual is not a marketplace where you post a job and hope for the best. It's a fully departmentalized creative agency — with real accountability at every level.
          </p>
        </motion.div>
      </section>

      {/* ── Department Structure ──────────────────────────────────── */}
      <section id="quality-assurance" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>
              How It's Built
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Department Structure
            </h2>
            <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every creative category — Video Editing, 3D Animation, CGI, Script Writing, Graphic Design — is its own independent department with a designated head. These heads actively manage project flow, enforce quality standards, and are personally accountable for every deliverable that leaves their department.
            </p>
            <p className="text-lg max-w-2xl leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>
              When you hire Virtual for video editing, you're not getting a random freelancer. You're getting an organized team with a professional chain of command behind every frame.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Structured Execution", desc: "A defined chain of command handles your project — not a single person working in isolation." },
              { label: "Quality Assurance", desc: "Every deliverable passes through a Momentum Supervisor review before it reaches you." },
              { label: "On-Time Delivery", desc: "Timelines are set at the start, tracked live, and enforced by the department head. Delays are flagged internally before they become your problem." }
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <CheckCircle size={20} className="mb-4" style={{ color: 'var(--accent)' }} />
                <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wallet & Escrow ───────────────────────────────────────── */}
      <section id="escrow-protection" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>
              Payment Security
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Wallet & Escrow System
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Clients maintain a personal wallet on the platform. When a project is posted, the required payment moves into a locked escrow state tied directly to that project — visible as reserved, but completely inaccessible to any freelancer until the project clears all approval stages.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              The client cannot lose money without receiving the work. The freelancer cannot lose the work without receiving payment. Security is symmetric on both sides.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The project also operates under a content lock — clients can view progress, previews, and milestone reports in real time, but cannot access or download any final deliverable until they formally approve the completed work. Approval triggers the escrow release. No approval, no release.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div
              className="w-64 h-64 rounded-full flex items-center justify-center relative"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle at center, rgba(96,10,10,0.08) 0%, transparent 70%)' }}
              />
              <ShieldCheck size={80} strokeWidth={0.8} style={{ color: 'var(--accent)', opacity: 0.6 }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dispute Resolution ────────────────────────────────────── */}
      <section className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>
              Conflict Resolution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Dispute Resolution System
            </h2>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Disputes on Virtual are not handled by a chatbot or a ticket system. Every dispute is managed by a dedicated Dispute Handler — a trained human mediator assigned to the case.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: <Users size={20} />,
                label: "The Right People in the Room",
                desc: "A structured resolution meeting is convened with exactly the right parties: the client, the Project Initiator(s), the Momentum Supervisor, and the assigned Dispute Handler."
              },
              {
                icon: <MonitorPlay size={20} />,
                label: "Built-In Video Meet Window",
                desc: "The meeting takes place inside Virtual's own dispute resolution web meet window — a private, recorded video environment integrated directly into the platform. No third-party tools, no email chains."
              },
              {
                icon: <Scale size={20} />,
                label: "Documented & Structured",
                desc: "Everything is documented, structured, and resolved within the platform itself. Transparent, fast, and fair for every party involved."
              },
              {
                icon: <CheckCircle size={20} />,
                label: "Human Accountability",
                desc: "The Dispute Handler facilitates the session and drives resolution. A real person — not an algorithm — is responsible for the outcome."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="p-6 rounded-2xl border flex gap-4"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <div className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }}>{item.icon}</div>
                <div>
                  <div className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Structured Teams ──────────────────────────────────────── */}
      <section id="structured-teams" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>Structured Teams</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Not a group of freelancers.<br />A structured team.
            </h2>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Every project on Virtual is executed by a structured team — not a random collection of individuals. Each team is built around a Project Initiator who owns the project outcome, a set of Crate-level specialists who execute the micro-tasks, and a Momentum Supervisor who reviews quality before anything reaches the client.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Defined Roles', desc: 'Every team member has a clear role — Crate executes, Initiator leads, Supervisor reviews. No ambiguity about who is responsible for what.' },
              { label: 'Accountability at Every Level', desc: 'The Project Initiator is personally accountable for the team\'s output. If a task fails quality review, it goes back — not to the client.' },
              { label: 'Scalable by Design', desc: 'Teams are assembled per project based on skill requirements. The right people are matched to the right work, every time.' },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="p-6 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <CheckCircle size={20} className="mb-4" style={{ color: 'var(--accent)' }} />
                <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Earn While You Learn ──────────────────────────────────── */}
      <section id="earn-while-you-learn" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>Earn While You Learn</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              The learning process pays you.
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Traditional skill development costs money — courses, bootcamps, certifications. Virtual flips this entirely. From your very first micro-task as a Precrate, you are earning real compensation for real work delivered to real clients.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Every task you complete builds your portfolio, your earnings, and your tier progression simultaneously. There is no separation between learning and earning — they happen in the same moment, on the same task.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The more you improve, the more complex the tasks you receive, and the higher the compensation. Growth is not just career advancement — it is a direct increase in your income.
            </p>
          </motion.div>
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Start as Precrate', desc: 'Complete foundational modules and receive your first paid micro-task.' },
                { step: '02', title: 'Earn on Every Task', desc: 'Each completed and approved task adds directly to your wallet. No waiting, no thresholds.' },
                { step: '03', title: 'Grow Your Tier', desc: 'Performance data drives promotion. Higher tier = more complex work = higher pay.' },
                { step: '04', title: 'Build a Real Portfolio', desc: 'Every task is real client work. Your portfolio builds itself as you earn.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-black opacity-20 shrink-0 w-8" style={{ color: 'var(--accent)' }}>{item.step}</div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Real Portfolio Work ───────────────────────────────────── */}
      <section id="real-portfolio-work" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>Real Portfolio Work</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Every task is real work.<br />For real clients.
            </h2>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Nothing on Virtual is simulated. Every micro-task you complete is part of an actual client project — real briefs, real deadlines, real deliverables. When you finish a task, it goes into a real product that a real client receives and pays for.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Client-Grade Deliverables', desc: 'Your work meets the same quality bar as any professional agency output. Momentum Supervisors review everything before it ships.' },
              { label: 'Attributable Work History', desc: 'Every completed task is logged to your profile — the skill, the complexity, the client category, and the outcome. Your track record builds automatically.' },
              { label: 'No Spec Work', desc: 'You are never asked to work for free "to prove yourself." Every task is compensated from the moment it is assigned.' },
              { label: 'Portfolio That Speaks for Itself', desc: 'When you apply for higher-tier work or external opportunities, your Virtual portfolio shows verified, real-world output — not personal projects or course assignments.' },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="p-6 rounded-2xl border flex gap-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chain of Command ──────────────────────────────────────── */}
      <section id="chain-of-command" className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>Chain of Command</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Accountability flows in one direction.
            </h2>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Virtual operates on a strict chain of command. Every person in the system reports to someone above them, and is responsible for someone below them. This is not bureaucracy — it is the mechanism that makes quality and accountability possible at scale.
            </p>
          </motion.div>
          <div className="space-y-3">
            {[
              { tier: 'Admin', color: '#ef4444', desc: 'Sets platform standards, approves Momentum Supervisors, and maintains overall integrity.' },
              { tier: 'Momentum Supervisor', color: '#f59e0b', desc: 'Oversees 5+ Project Initiators. Reviews all deliverables before client delivery. Manages quality across departments.' },
              { tier: 'Project Initiator', color: '#8b5cf6', desc: 'Owns the project outcome. Fragments work into micro-tasks, assigns to Crates, and is personally accountable for the final deliverable.' },
              { tier: 'Crate', color: '#3b82f6', desc: 'Executes assigned micro-tasks under direct supervision. Builds skills and portfolio through real client work.' },
              { tier: 'Precrate', color: '#6b7280', desc: 'Completes foundational training and verification. Receives first paid tasks upon promotion to Crate.' },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="flex items-start gap-4 p-5 rounded-xl border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', borderLeft: `3px solid ${item.color}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: item.color + '22', color: item.color }}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.tier}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t text-center relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.05 }}
        />
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6" style={{ color: 'var(--text-primary)' }}>
            Ready to work with a real team?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            Post your project and get a structured department behind it — escrow-protected, supervisor-reviewed, delivered on time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup?role=client')}
              className="btn-primary py-3.5 px-8 text-sm font-bold tracking-wide flex items-center gap-2"
            >
              Post a Project <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/signup?role=freelancer')}
              className="btn-ghost py-3.5 px-8 text-sm font-bold tracking-wide"
            >
              Join as Talent
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
