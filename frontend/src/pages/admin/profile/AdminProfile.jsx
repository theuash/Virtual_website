import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { User, Mail, Calendar, ShieldCheck, CheckCircle2, Lock, Activity, Server } from "lucide-react";
import AvatarCircle, { resolveAvatar } from "../../components/common/AvatarCircle";
import { motion } from "framer-motion";

export default function AdminProfile() {
  const { user } = useAuth();
  const initial = (user?.name || user?.email || "A").charAt(0).toUpperCase();

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "System Genesis";

  return (
    <>
      <DashboardHeader title="System Administrator" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden relative"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="h-32 w-full" style={{ background: "linear-gradient(to right, #111827, #374151)", opacity: 0.9 }} />
          
          <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
            {user?.avatar ? (
              <div className="rounded-full border-4 shadow-xl" style={{ borderColor: "var(--bg-secondary)" }}>
                <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={120} />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-full border-4 flex items-center justify-center text-4xl font-black shadow-xl"
                style={{ background: "var(--bg-card)", color: "var(--text-primary)", borderColor: "var(--bg-secondary)" }}>
                {initial}
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
              <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2" style={{ color: "var(--text-primary)" }}>
                {user?.name || "Administrator"}
                <ShieldCheck size={24} style={{ color: "var(--accent)" }} />
              </h1>
              <div className="text-xs font-bold mt-1 uppercase tracking-widest px-3 py-1 rounded-lg inline-block border"
                style={{ background: "var(--bg-card)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                Full System Authority
              </div>
              <p className="text-sm mt-3 opacity-70 flex items-center justify-center md:justify-start gap-1" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Active since {memberSince}
              </p>
            </div>
            
            <div className="hidden md:flex gap-6 mb-2">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>ROOT</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Access</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: System Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Server size={14} /> Authority Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 opacity-50" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Admin Email</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock size={16} className="mt-0.5 opacity-50" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Security Clearance</p>
                    <p className="text-sm font-medium">Level 10 (System Admin)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: System History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Activity size={14} /> Administrative Logs
              </h3>
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <ShieldCheck size={40} className="mb-2" />
                <p className="text-sm">Audit trail will populate based on system interactions.</p>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <CheckCircle2 size={14} /> Platform Governance
              </h3>
              <div className="p-4 rounded-xl border flex items-center gap-4" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                <div className="p-3 rounded-full bg-accent/10" style={{ color: "var(--accent)" }}>
                  <Lock size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Genesis Authority</p>
                  <p className="text-[10px] opacity-60">Full overrides for disputes, promotions, and escrow flows enabled.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
