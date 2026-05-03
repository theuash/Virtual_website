import { useAuth } from "../../../context/AuthContext";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import { User, Mail, Phone, Calendar, Link, Clock, Star, MapPin, Award, CheckCircle2 } from "lucide-react";
import AvatarCircle, { resolveAvatar } from "../../../components/common/AvatarCircle";
import { TIER_LABELS } from "../../../utils/roleGuards";
import { motion } from "framer-motion";

export default function FreelancerProfile() {
  const { user } = useAuth();
  const initial = (user?.fullName || "U").charAt(0).toUpperCase();
  const tierLabel = user?.tier ? TIER_LABELS[user.tier] : "Precrate";

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <>
      <DashboardHeader title="My Profile" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Top Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden relative"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {/* Cover gradient */}
          <div className="h-32 w-full" style={{ background: "linear-gradient(to right, var(--accent), var(--forest))", opacity: 0.8 }} />
          
          <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
            {user?.avatar ? (
              <div className="rounded-full border-4 shadow-xl" style={{ borderColor: "var(--bg-secondary)" }}>
                <AvatarCircle src={resolveAvatar(user.avatar)} initial={initial} size={120} />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-full border-4 flex items-center justify-center text-4xl font-black shadow-xl"
                style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--bg-secondary)" }}>
                {initial}
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
              <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2" style={{ color: "var(--text-primary)" }}>
                {user?.fullName || "Freelancer Name"}
                {user?.isVerified && <CheckCircle2 size={24} style={{ color: "var(--accent)" }} />}
              </h1>
              <div className="text-sm font-medium mt-1 uppercase tracking-widest px-2.5 py-1 rounded-full inline-block"
                style={{ background: "var(--accent)", color: "#fff" }}>
                {tierLabel} Specialist
              </div>
              <p className="text-sm mt-3 opacity-70 flex items-center justify-center md:justify-start gap-1" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Member since {memberSince}
              </p>
            </div>
            
            <div className="hidden md:flex gap-4 mb-2">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{user?.tasksCompleted || 0}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{user?.successRate || "100"}%</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Success</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Contact & Prefs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <User size={14} /> Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Email</p>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user?.email}</p>
                  </div>
                </div>
                {user?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Phone</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.phone}</p>
                    </div>
                  </div>
                )}
                {user?.portfolioUrl && (
                  <div className="flex items-start gap-3">
                    <Link size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Portfolio</p>
                      <a href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                        {user.portfolioUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Clock size={14} /> Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Hours Per Week</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.hoursPerWeek ? `${user.hoursPerWeek} hrs / week` : "Flexible"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Contact Window</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.preferredContactTime || "Anytime"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Skills & Bio */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Star size={14} /> Professional Skills
              </h3>
              
              {user?.primarySkill ? (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-2" style={{ color: "var(--text-secondary)" }}>Primary Department</h4>
                    <div className="inline-flex items-center px-4 py-2 rounded-xl" style={{ background: "rgba(110,44,242,0.1)", border: "1px solid rgba(110,44,242,0.3)" }}>
                      <span className="text-sm font-bold capitalize" style={{ color: "var(--accent)" }}>
                        {user.primarySkill.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {(user.secondarySkills && user.secondarySkills.length > 0) && (
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-2" style={{ color: "var(--text-secondary)" }}>Secondary Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.secondarySkills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                            {skill.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-60" style={{ color: "var(--text-secondary)" }}>No skills mapped yet. Complete onboarding or contact a supervisor.</p>
              )}
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Award size={14} /> Performance Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border flex flex-col justify-center text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Current Rank</p>
                  <p className="text-lg font-black uppercase" style={{ color: "var(--accent)" }}>{user?.tier || "PreCrate"}</p>
                </div>
                <div className="p-4 rounded-xl border flex flex-col justify-center text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Tasks Delivered</p>
                  <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{user?.tasksCompleted || 0}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
