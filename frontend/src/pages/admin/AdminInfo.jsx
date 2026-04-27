import { motion } from 'framer-motion';
import { Info, Scale, ShieldAlert, Database, Lock, CheckCircle2 } from 'lucide-react';

export default function AdminInfo() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-accent" />
            System Governance & Ops
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Core administrative protocols for system health and dispute resolution.
          </p>
        </div>
      </div>

      <section className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">Admin Responsibility</h2>
        <p className="text-sm opacity-80 mb-6 leading-relaxed max-w-4xl">
          As an Administrator, you oversee the high-level health of the Virtual ecosystem. This includes technical system monitoring, final dispute arbitration, and human-in-the-loop verification for elite tier promotions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "System Oversight", 
              icon: <Database size={20} />,
              desc: "Manage user data, platform configurations, and overall stability of the service execution engine." 
            },
            { 
              title: "Dispute Arbitration", 
              icon: <Scale size={20} />,
              desc: "Provide final resolution for project disputes. Review both client and freelancer evidence to ensure fairness." 
            },
            { 
              title: "Tier Verification", 
              icon: <ShieldAlert size={20} />,
              desc: "Review and approve high-level rank promotions. Ensure that Initiators and Supervisors maintain elite metrics." 
            }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 border border-accent/20" style={{ color: 'var(--accent)' }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold mt-10 mb-6">Operational Priority</h2>
      <div className="space-y-4">
        {[
          { title: "Maintain System Integrity", desc: "Ensure that all automated processes—like escrow and task dispatch—are functioning without technical debt." },
          { title: "Uphold Meritocracy", desc: "Audit the algorithmic promotion data. Prevent any human bias or errors from affecting freelancer career trajectories." },
          { title: "Financial Security", desc: "Verify major payout requests and monitor for suspicious transaction patterns across the wallet system." }
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <Lock size={20} className="mt-1 text-accent opacity-50" />
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
