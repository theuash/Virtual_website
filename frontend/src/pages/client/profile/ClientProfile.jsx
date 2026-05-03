import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { User, Mail, Globe, Building2, Calendar, MapPin, Briefcase, CheckCircle2, Edit2, Camera, Image as ImageIcon } from "lucide-react";
import AvatarCircle, { resolveAvatar } from "../../components/common/AvatarCircle";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ClientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.fullName || "C").charAt(0).toUpperCase();

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <>
      <DashboardHeader title="Client Profile" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden relative"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="h-32 w-full relative group" style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)", opacity: 0.8 }}>
            <button 
              onClick={() => navigate('/client/settings')}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold"
            >
              <ImageIcon size={14} /> Change Cover
            </button>
          </div>
          
          <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
            <div className="relative group">
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
              <button 
                onClick={() => navigate('/client/settings')}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border-2 border-white/10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Camera size={14} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
              <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2" style={{ color: "var(--text-primary)" }}>
                {user?.fullName || "Client Name"}
                {user?.isVerified && <CheckCircle2 size={24} style={{ color: "var(--accent)" }} />}
              </h1>
              <p className="text-sm font-semibold opacity-70 flex items-center justify-center md:justify-start gap-1" style={{ color: "var(--text-secondary)" }}>
                <Building2 size={16} /> {user?.companyName || "Independent Client"}
              </p>
              <p className="text-sm mt-3 opacity-70 flex items-center justify-center md:justify-start gap-1" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Registered {memberSince}
              </p>
            </div>
            
            <div className="hidden md:flex gap-6 mb-2 items-end">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{user?.projectsPosted || 0}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>0</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-secondary)" }}>Reviews</p>
              </div>
              <button 
                onClick={() => navigate('/client/settings')}
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
            
            <button 
              onClick={() => navigate('/client/settings')}
              className="md:hidden mt-4 flex items-center justify-center w-full gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--bg-card)" }}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Contact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <User size={14} /> Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Email</p>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Role</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Client</p>
                  </div>
                </div>
                {user?.userId && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>System ID</p>
                      <p className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>{user.userId}</p>
                    </div>
                  </div>
                )}
                {user?.clientId && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Client ID</p>
                      <p className="text-sm font-bold font-mono text-accent" style={{ color: "var(--accent)" }}>{user.clientId}</p>
                    </div>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 opacity-50" style={{ color: "var(--text-primary)" }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: "var(--text-secondary)" }}>Location</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Company & Extra Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Building2 size={14} /> Company Profile
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Company / Organization</h4>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{user?.companyName || "Individual Account"}</p>
                </div>
                {user?.companyWebsite && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Website</h4>
                    <a href={user.companyWebsite.startsWith('http') ? user.companyWebsite : `https://${user.companyWebsite}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: "var(--accent)" }}>
                      <Globe size={14} /> {user.companyWebsite.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <CheckCircle2 size={14} /> Project Statistics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Total Posted</p>
                  <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{user?.projectsPosted || 0}</p>
                </div>
                <div className="p-4 rounded-xl border text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Completed</p>
                  <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>0</p>
                </div>
                <div className="p-4 rounded-xl border text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1" style={{ color: "var(--text-secondary)" }}>Member Level</p>
                  <p className="text-lg font-black" style={{ color: "var(--accent)" }}>Verified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
