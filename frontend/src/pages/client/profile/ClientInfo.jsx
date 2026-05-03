import { motion } from 'framer-motion';
import { Info, HelpCircle, ShieldCheck, CreditCard, Layout, Zap, CheckCircle2 } from 'lucide-react';

export default function ClientInfo() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-accent" />
            Client Guide & Workflow
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Learn how optimized execution and escrow protection work for your projects.
          </p>
        </div>
      </div>

      {/* Core Workflow Section */}
      <section className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">The Virtual Experience</h2>
        <p className="text-sm opacity-80 mb-6 leading-relaxed max-w-4xl">
          Virtual isn't just a marketplace; it's a managed execution engine. When you post a project, our structured hierarchy ensures that every deliverable passes through multiple quality checks before reaching you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Structured Execution", 
              icon: <Layout size={20} />,
              desc: "Every project is broken down into micro-tasks. Specialized freelancers handle specific segments, ensuring focused expertise on every detail." 
            },
            { 
              title: "Escrow Protection", 
              icon: <ShieldCheck size={20} />,
              desc: "Your funds are securely held in our escrow system. We only release payments once you formally approve the completed milestones." 
            },
            { 
              title: "Quality Control", 
              icon: <Zap size={20} />,
              desc: "A designated Momentum Supervisor reviews every task to ensure it meets our elite standards before the project reaches its final assembly." 
            }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 border border-accent/20" style={{ color: 'var(--accent)' }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <h2 className="text-xl font-bold mt-10 mb-6">How Your Project Moves</h2>
      <div className="space-y-4">
        {[
          {
            step: "01",
            title: "Post & Scope",
            desc: "Select a service from our curated catalogue. Our Project Initiators will then scope the exact requirements to ensure clarity."
          },
          {
            step: "02",
            title: "Escrow Funding",
            desc: "Fund the project to signal the start. The money stays safe until the work is finalized and approved by you."
          },
          {
            step: "03",
            title: "Fragmented Production",
            desc: "The project is distributed across our Crate specialist network. Multiple experts work in parallel for maximum speed."
          },
          {
            step: "04",
            title: "Final Assembly & QA",
            desc: "Your Project Initiator assembles the micro-tasks into a unified deliverable, which is then double-checked by a Supervisor."
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-5 rounded-2xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-xl font-black opacity-20" style={{ color: 'var(--accent)' }}>{item.step}</div>
            <div>
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs opacity-70 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Helpful Tips Toggle area or just text */}
      <div className="mt-12 p-6 rounded-2xl border flex items-center gap-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <HelpCircle size={40} className="opacity-20 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Need help with a project?</h4>
          <p className="text-xs opacity-70 mt-1">Our Dispute Handlers and Admin team are always standing by to ensure a professional resolution to any roadblock.</p>
        </div>
      </div>
    </div>
  );
}
