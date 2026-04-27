import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/DashboardHeader";
import { User, Mail, Calendar, Briefcase, CheckCircle2, TrendingUp, Award, BarChart3 } from "lucide-react";
import AvatarCircle, { resolveAvatar } from "../../components/AvatarCircle";
import { motion } from "framer-motion";

export default function InitiatorProfile() {
  const { user } = useAuth();
  const initial = (user?.fullName || "I").charAt(0).toUpperCase();

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <>
      <DashboardHeader title="Initiator Profile" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden relative"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="h-32 w-full" style={{ background: "linear-gradient(to right, #8b5cf6, #3b82f6)", opacity: 0.8 }} />
          
          <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
            {user?.avatar ? (
              <div className="rounded-full border-4 shadow-xl" style={{ borderColor: "var(--bg-secondary)" }}>
                <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={120} />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-full border-4 flex items-center justify-center text-4xl font-black shadow-xl"
                style={{ background: "#8b5cf6", color: "#fff", borderColor: "var(--bg-secondary)" }}>
                {initial}
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
              <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2" style={{ color: "var(--text-primary)" }}>
                {user?.fullName || "Initiator Name"}
                {user?.isVerified && <CheckCircle2 size={24} style={{ color: "#8b5cf6" }} />}
              </h1>
              <div className="text-xs font-bold mt-1 uppercase tracking-widest px-3 py-1 rounded-lg inline-block"
                style={{ background: "#8b5cf6", color: "#fff" }}>
                Project Initiator
              </div>
              <p className="text-sm mt-3 opacity-70 flex items-center justify-center md:justify-start gap-1" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Onboarded {memberSince}
              </p>
            </div>
            
            <div className="hidden md:flex gap-6 mb-2">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>0</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>0</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Success</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <BarChart3 size={14} /> Execution Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-60">Scoping Speed</span>
                  <span className="text-sm font-bold">Excellent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-60">Client Rating</span>
                  <span className="text-sm font-bold">5.0 / 5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-60">Fragmentation Error</span>
                  <span className="text-sm font-bold opacity-40">0%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <User size={14} /> Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 opacity-50" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Email</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: History/Bio */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <TrendingUp size={14} /> Performance History
              </h3>
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <Activity size={40} className="mb-2" />
                <p className="text-sm">Activity data will populate as you scope projects.</p>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Award size={14} /> System Rank
              </h3>
              <div className="p-4 rounded-xl border flex items-center gap-4" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                <div className="p-3 rounded-full bg-accent/10" style={{ color: "var(--accent)" }}>
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Standard Initiator</p>
                  <p className="text-[10px] opacity-60">Verified member of the Virtual orchestration team.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
