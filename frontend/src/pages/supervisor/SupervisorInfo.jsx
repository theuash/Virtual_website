import { motion } from 'framer-motion';
import { Info, ShieldCheck, Search, Users, CheckCircle2, Zap } from 'lucide-react';

export default function SupervisorInfo() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-[#f59e0b]" />
            Supervisor Protocol
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Upholding elite standards and overseeing departmental excellence.
          </p>
        </div>
      </div>

      <section className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">Your Role as a Supervisor</h2>
        <p className="text-sm opacity-80 mb-6 leading-relaxed max-w-4xl">
          Momentum Supervisors are the final line of defense for quality at Virtual. You manage the departmental "Crate" specialists, dispatch micro-tasks, and review every deliverable to ensure it exceeds client expectations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Quality Assurance", 
              icon: <ShieldCheck size={20} />,
              desc: "Every task completed by the Crate network must be reviewed and approved by you before it moves to final assembly." 
            },
            { 
              title: "Dispatch & Oversight", 
              icon: <Search size={20} />,
              desc: "Assign micro-tasks to the right specialists based on their performance metrics and current availability." 
            },
            { 
              title: "Team Mentorship", 
              icon: <Users size={20} />,
              desc: "Guide Pre-Crate and Crate specialists. Your feedback is the primary data point for our algorithmic promotion system." 
            }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 border border-orange-500/20" style={{ color: '#f59e0b' }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold mt-10 mb-6">Oversight Workflow</h2>
      <div className="space-y-4">
        {[
          { title: "Task Dispatch", desc: "Monitor incoming projects from Initiators. Select the most suitable Crate specialist and dispatch the micro-tasks." },
          { title: "Review Deliverables", desc: "Inspect every submission. Check for technical precision, alignment with the brief, and elite quality." },
          { title: "Feedback Loop", desc: "Provide constructive rejection if quality is low. This data directly impacts the specialist's Quality Score." },
          { title: "Promotion Verification", desc: "The system flags eligible specialists for promotion; you provide the final human override if necessary." }
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <CheckCircle2 size={20} className="mt-1 text-[#f59e0b]" />
            <div>
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs opacity-70 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
