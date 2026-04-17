import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, ArrowRight, ShieldCheck, Users, BarChart3, MonitorPlay, Scale, ChevronLeft
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <Header />

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
      <section className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
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
      <section className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
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

      {/* ── Platform Features ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--accent)' }}>
              Core Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              How the platform works
            </h2>
          </motion.div>

          <div className="space-y-px" style={{ borderColor: 'var(--border)' }}>
            {[
              {
                tag: "Micro-Task Distribution",
                title: "Every project is broken down, not handed off whole.",
                desc: "Virtual's Project Initiators fragment every incoming project into precision-scoped micro-tasks. Each task is sized and defined based on the skill it requires, the complexity it carries, and the tier of specialist best suited to execute it. Work is matched to specialists through AI-driven mastery tiers — the system knows who is ready for what, and assigns accordingly."
              },
              {
                tag: "Algorithmic Growth",
                title: "Advancement is earned, not given.",
                desc: "Growth on Virtual is triggered entirely by performance data. The algorithm tracks three variables that cannot be faked: accuracy of deliverables, speed of completion, and volume of work processed. When a freelancer's data crosses a promotion threshold, the system flags them automatically. No subjective bias. Your ascent is a direct reflection of your output."
              },
              {
                tag: "Live Command Dashboard",
                title: "You always know exactly where your project stands.",
                desc: "Clients have access to a command center that gives total transparency over every project in real time. The dashboard displays the full micro-task breakdown — which tasks are in progress, under review, and completed — live, as it happens. Clients can communicate directly with their assigned Project Initiator from inside the dashboard. No ambiguity, no waiting for updates."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="py-8 border-t grid md:grid-cols-3 gap-6"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{item.tag}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
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
