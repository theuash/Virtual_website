import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Target, ShieldCheck, Zap, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FreelancerInfo() {
  const { user } = useAuth();
  
  const roles = [
    {
      title: "Pre-Crate",
      icon: <Target size={24} className="text-gray-400" />,
      color: "var(--border)",
      desc: "The entry point. Complete designated learning paths and basic shadow tasks to prove reliability.",
      reqs: ["Complete Onboarding", "Watch Learning Modules", "Pass Initial Assessment"]
    },
    {
      title: "Crate",
      icon: <Zap size={24} className="text-yellow-500" />,
      color: "var(--accent)",
      desc: "An active specialist. You are now receiving micro-tasks within your department and earning.",
      reqs: ["100% On-Time Delivery for 10 tasks", "Zero unresolved disputes", "Maintained Quality Score > 90%"]
    },
    {
      title: "Project Initiator",
      icon: <Users size={24} className="text-blue-500" />,
      color: "#3b82f6",
      desc: "Client-facing leader. Responsible for scoping client requirements, structuring the project into micro-tasks, and overseeing the delivery assembly line.",
      reqs: ["Consistently top performer as Crate", "Strong communication metrics", "Algorithmic selection based on task volume"]
    },
    {
      title: "Momentum Supervisor",
      icon: <ShieldCheck size={24} className="text-purple-500" />,
      color: "#8b5cf6",
      desc: "The quality assurance gatekeeper. Reviews all Crate deliveries before they reach the Project Initiator or Client.",
      reqs: ["Flawless track record", "Deep department expertise", "Selected by Admin algorithms"]
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-accent" />
            Roles & Promotion System
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Understand the algorithmic growth system and what it takes to climb the ranks.
          </p>
        </div>
      </div>

      {/* Promotion Logic Section */}
      <section className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">How Promotion Works</h2>
        <p className="text-sm opacity-80 mb-6 leading-relaxed max-w-4xl">
          Advancement within Virtual is entirely meritocratic and algorithmically driven. We do not use office politics or subjective performance reviews. Your promotion is determined by hard data: <strong style={{ color: 'var(--accent)' }}>Speed, Accuracy, and Volume</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Accuracy & Quality", desc: "Every task you submit is reviewed by a Momentum Supervisor. High acceptance rates without revisions build your Quality Score." },
            { title: "Speed & Reliability", desc: "Deadlines are absolute. Consistently delivering ahead of schedule without asking for extensions builds your Velocity Score." },
            { title: "Algorithmic Trigger", desc: "Once your metrics cross predefined thresholds for your department, the system will automatically promote you to the next tier." }
          ].map((metric, i) => (
            <div key={i} className="p-4 rounded-xl border flex flex-col gap-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold text-sm">{metric.title}</h3>
              <p className="text-xs opacity-70">{metric.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Breakdown */}
      <h2 className="text-xl font-bold mt-10 mb-6">The Tier System</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border flex flex-col relative overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: role.color }} />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                {role.icon}
              </div>
              <h3 className="font-bold text-lg">{role.title}</h3>
            </div>
            
            <p className="text-sm opacity-75 mb-6 flex-1">
              {role.desc}
            </p>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-3 opacity-50">
                <ArrowUpRight size={12} /> Promotion Requirements
              </div>
              <ul className="space-y-2">
                {role.reqs.map((req, j) => (
                  <li key={j} className="text-xs flex items-start gap-2 opacity-80">
                    <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: role.color }} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
