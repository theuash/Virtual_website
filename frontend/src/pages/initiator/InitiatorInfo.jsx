import { motion } from 'framer-motion';
import { Info, Target, Layers, FileText, CheckCircle2, Zap } from 'lucide-react';

export default function InitiatorInfo() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-[#8b5cf6]" />
            Initiator Handbook
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Mastering the art of project scoping and micro-task fragmentation.
          </p>
        </div>
      </div>

      <section className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">Your Role as an Initiator</h2>
        <p className="text-sm opacity-80 mb-6 leading-relaxed max-w-4xl">
          As a Project Initiator, you are the bridge between technical execution and client requirements. Your primary objective is to take complex project briefs and break them down into precise, executable micro-tasks for the Crate network.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Scoping & Fragmentation", 
              icon: <Layers size={20} />,
              desc: "Convert high-level projects into individual tasks. The more precise your scope, the higher the quality of the final assembly." 
            },
            { 
              title: "Client Coordination", 
              icon: <Target size={20} />,
              desc: "Communicate directly with clients to clarify requirements and manage expectations throughout the production lifecycle." 
            },
            { 
              title: "Task Orchestration", 
              icon: <Zap size={20} />,
              desc: "Oversee the distribution of tasks. You ensure that all micro-deliverables align seamlessly during the final project assembly." 
            }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/20" style={{ color: '#3b82f6' }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold mt-10 mb-6">Execution Protocol</h2>
      <div className="space-y-4">
        {[
          { title: "Review Client Brief", desc: "Understand every requirement and potential constraint before initiating the project skeleton." },
          { title: "Define Micro-Tasks", desc: "Break the project into the smallest possible logical units. Assign clear titles, tags, and descriptions to each." },
          { title: "Set Precise Deadlines", desc: "Build in buffers for QA stages. Ensure that micro-task deadlines allow for Supervisor review." },
          { title: "Final Assembly", desc: "Verify all received deliveries from the Crate network. Assemble them into the final project package for the client." }
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <CheckCircle2 size={20} className="mt-1 text-[#8b5cf6]" />
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
