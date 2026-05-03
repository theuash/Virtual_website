import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import api from "../../../services/api";
import { FolderKanban, Loader2, AlertCircle, Zap, Target, Calendar, DollarSign, Tag, ChevronRight, RefreshCw } from "lucide-react";

const STATUS_CFG = {
  open:          { label: "Open",          color: "#3b82f6", bg: "#3b82f622" },
  in_progress:   { label: "In Progress",   color: "#f59e0b", bg: "#f59e0b22" },
  under_review:  { label: "Under Review",  color: "#8b5cf6", bg: "#8b5cf622" },
  completed:     { label: "Completed",     color: "#10b981", bg: "#10b98122" },
  cancelled:     { label: "Cancelled",     color: "#ef4444", bg: "#ef444422" },
};

const SKILL_LABELS = {
  video_editing: "Video Editing", "3d_animation": "3D Animation",
  cgi: "CGI / VFX", script_writing: "Script Writing", graphic_designing: "Graphic Design",
};

function ProjectCard({ project, index }) {
  const navigate = useNavigate();
  const s = STATUS_CFG[project.status] || STATUS_CFG.open;
  const isTimeSensitive = project.timeSensitive;
  const isConsultancy   = project.experienceFormat === "priority" || project.isOpenProject;
  const deadline = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline - Date.now()) / 86400000) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-secondary)", borderColor: isTimeSensitive ? "#ef4444" : isConsultancy ? "#f59e0b" : "var(--border)" }}>
      <div className="h-1 w-full" style={{ background: isTimeSensitive ? "#ef4444" : isConsultancy ? "#f59e0b" : s.color }} />
      <div className="p-5 space-y-4">
        {/* Priority badges */}
        <div className="flex flex-wrap gap-1.5">
          {isTimeSensitive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: "#ef444422", color: "#ef4444" }}>
              <Zap size={9} fill="#ef4444" /> TIME SENSITIVE
            </span>
          )}
          {isConsultancy && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: "#f59e0b22", color: "#f59e0b" }}>
              <Target size={9} /> CONSULTANCY
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold ml-auto"
            style={{ background: s.bg, color: s.color }}>{s.label}</span>
        </div>

        {/* Title + client */}
        <div>
          <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{project.title}</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {project.clientId?.fullName || "-"} {project.clientId?.company ? ` ${project.clientId.company}` : ""}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <Tag size={10} />{SKILL_LABELS[project.category] || project.category}
          </span>
          {(project.totalAmount || project.openBudget) && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <DollarSign size={10} />?{(project.totalAmount || project.openBudget).toLocaleString("en-IN")}
            </span>
          )}
          {daysLeft !== null && (
            <span className="flex items-center gap-1 text-[10px] font-bold"
              style={{ color: daysLeft < 0 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : "var(--text-secondary)" }}>
              <Calendar size={10} />
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
        </div>

        {/* Task summary */}
        {project.taskSummary && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full" style={{
                width: project.taskSummary.total > 0 ? `${Math.round(project.taskSummary.approved / project.taskSummary.total * 100)}%` : "0%",
                background: s.color,
              }} />
            </div>
            <span className="text-[10px] shrink-0" style={{ color: "var(--text-secondary)" }}>
              {project.taskSummary.approved}/{project.taskSummary.total} tasks
            </span>
          </div>
        )}

        {/* Inspect button */}
        <button
          onClick={() => navigate(`/supervisor/dispatch/${project._id}`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: isTimeSensitive ? "#ef4444" : isConsultancy ? "#f59e0b" : "var(--accent)", color: "#fff" }}>
          Inspect <ChevronRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default function SupervisorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("all");

  const load = () => {
    setLoading(true);
    api.get("/supervisor/projects")
      .then(res => setProjects(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? projects
    : filter === "urgent" ? projects.filter(p => p.timeSensitive)
    : filter === "consultancy" ? projects.filter(p => p.experienceFormat === "priority" || p.isOpenProject)
    : projects.filter(p => p.status === filter);

  const urgentCount = projects.filter(p => p.timeSensitive).length;
  const consultCount = projects.filter(p => p.experienceFormat === "priority" || p.isOpenProject).length;

  return (
    <>
      <DashboardHeader title="Projects" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all",         label: "All",          count: projects.length },
              { id: "urgent",      label: "? Urgent",    count: urgentCount,   color: "#ef4444" },
              { id: "consultancy", label: "?? Consultancy", count: consultCount, color: "#f59e0b" },
              { id: "open",        label: "Open",         count: projects.filter(p => p.status === "open").length },
              { id: "in_progress", label: "In Progress",  count: projects.filter(p => p.status === "in_progress").length },
              { id: "completed",   label: "Completed",    count: projects.filter(p => p.status === "completed").length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  background:  filter === tab.id ? (tab.color || "var(--accent)") : "var(--bg-card)",
                  color:       filter === tab.id ? "#fff" : "var(--text-secondary)",
                  borderColor: filter === tab.id ? (tab.color || "var(--accent)") : "var(--border)",
                }}>
                {tab.label}
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: filter === tab.id ? "rgba(255,255,255,0.2)" : "var(--border)", color: filter === tab.id ? "#fff" : "var(--text-secondary)" }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-lg border transition-all hover:scale-105"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: "#f59e0b" }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: "#ef4444", opacity: 0.6 }} />
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{error}</p>
            <button onClick={load} className="mt-3 text-xs px-4 py-2 rounded-lg" style={{ background: "#f59e0b", color: "#fff" }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban size={40} strokeWidth={1} className="mb-4" style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
          </div>
        )}
      </div>
    </>
  );
}

