import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { SkeletonGrid, SkeletonProjectCard } from '../../components/ui/SkeletonLoader';
import {
  Search, Filter, Clock, DollarSign, CheckCircle2, 
  XCircle, PlayCircle, Eye, MoreVertical, Calendar,
  Star, Zap, AlertCircle, FileText
} from 'lucide-react';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Search },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: PlayCircle },
  under_review:{ label: 'Under Review',color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Eye },
  completed:   { label: 'Completed',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  cancelled:   { label: 'Cancelled',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

const CATEGORY_LABELS = {
  video_editing:     'Video Editing',
  '3d_animation':    '3D Animation',
  cgi:               'CGI / VFX',
  script_writing:    'Script Writing',
  graphic_designing: 'Graphic Design',
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = config.icon;
  
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function ProjectCard({ project, onView }) {
  const startDate = new Date(project.startDate);
  const deadline = new Date(project.deadline);
  const today = new Date();
  const daysLeft = deadline && !isNaN(deadline.getTime()) 
    ? Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const isOverdue = daysLeft < 0 && project.status !== 'completed' && project.status !== 'cancelled';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b flex items-start justify-between gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(110,44,242,0.1)', color: 'var(--accent)' }}
            >
              {CATEGORY_LABELS[project.category] || project.category}
            </span>
            {project.timeSensitive && (
              <span 
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
              >
                <Zap size={10} /> Time-Sensitive
              </span>
            )}
          </div>
          <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h3>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Budget */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Budget
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            {convert(Number(project.totalAmount || project.baseAmount || project.openBudget || 0)).display}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Start Date
          </span>
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Duration
          </span>
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {project.durationDays} days
          </span>
        </div>

        {/* Deadline */}
        {project.status !== 'completed' && project.status !== 'cancelled' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isOverdue ? 'Overdue by' : 'Deadline in'}
            </span>
            <span 
              className="text-sm font-semibold"
              style={{ color: isOverdue ? '#ef4444' : project.status === 'in_progress' ? '#f59e0b' : 'var(--text-primary)' }}
            >
              {isOverdue ? `${Math.abs(daysLeft)} days` : `${daysLeft} days`}
            </span>
          </div>
        )}

        {/* Payment status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Deposit
          </span>
          <div className="flex items-center gap-1.5">
            {project.depositPaid ? (
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#22c55e' }}>
                <CheckCircle2 size={12} /> Paid
              </span>
            ) : (
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#f59e0b' }}>
                <AlertCircle size={12} /> Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="p-3 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          Posted {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <button
          onClick={() => onView(project)}
          className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Eye size={12} /> View
        </button>
      </div>
    </motion.div>
  );
}

function EmptyState({ onPostNew }) {
  return (
    <div className="text-center py-16">
      <div 
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(110,44,242,0.1)' }}
      >
        <FileText size={32} style={{ color: 'var(--accent)' }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        No projects yet
      </h3>
      <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
        You haven't posted any projects. Create your first project and get matched with talented freelancers.
      </p>
      <button
        onClick={onPostNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <Zap size={16} /> Post a Project
      </button>
    </div>
  );
}

export default function ClientProjects() {
  const { convert } = useCurrency();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewProject, setViewProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const res = await api.get('/client/projects');
      console.log('Projects response:', res.data);
      setProjects(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const title = p.title || '';
    const category = CATEGORY_LABELS[p.category] || p.category || '';
    
    const matchesSearch = !search || 
      title.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          <div className="h-4 w-64 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border animate-pulse" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="h-3 w-12 rounded mb-2 animate-pulse" style={{ background: 'var(--border)' }} />
              <div className="h-6 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-20 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
        </div>

        {/* Projects grid skeleton */}
        <SkeletonGrid count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            My Projects
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage and track all your posted projects
          </p>
        </div>
        <Link
          to="/client/post-project"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Zap size={16} /> Post New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Open', value: stats.open, color: '#3b82f6' },
          { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, color: '#22c55e' },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </p>
            <p className="text-2xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'open', 'in_progress', 'under_review', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: filter === f ? 'none' : '1px solid var(--border)',
              }}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState onPostNew={() => window.location.href = '/client/post-project'} />
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No projects match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onView={(p) => setViewProject(p)}
            />
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {viewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setViewProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:mx-0 mx-4"
              style={{ background: 'var(--bg-secondary)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div 
                className="p-5 border-b flex items-start justify-between gap-4 sticky top-0"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: 'rgba(110,44,242,0.1)', color: 'var(--accent)' }}
                    >
                      {CATEGORY_LABELS[viewProject.category] || viewProject.category}
                    </span>
                    <StatusBadge status={viewProject.status} />
                  </div>
                  <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {viewProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setViewProject(null)}
                  className="p-2 rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.1)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {viewProject.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-[10px] font-medium uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Budget
                    </p>
                    <p className="text-lg font-black" style={{ color: 'var(--accent)' }}>
                      {convert(Number(viewProject.totalAmount || viewProject.baseAmount || viewProject.openBudget || 0)).display}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-[10px] font-medium uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Duration
                    </p>
                    <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                      {viewProject.durationDays} days
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-[10px] font-medium uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Start Date
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(viewProject.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-[10px] font-medium uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Deadline
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {viewProject.deadline ? new Date(viewProject.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Payment Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>30% Deposit</span>
                      <span className={`text-sm font-semibold flex items-center gap-1.5 ${viewProject.depositPaid ? 'text-green-500' : 'text-amber-500'}`}>
                        {viewProject.depositPaid ? <><CheckCircle2 size={14} /> Paid</> : <><AlertCircle size={14} /> Pending</>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>70% Final</span>
                      <span className={`text-sm font-semibold flex items-center gap-1.5 ${viewProject.finalPaid ? 'text-green-500' : 'text-amber-500'}`}>
                        {viewProject.finalPaid ? <><CheckCircle2 size={14} /> Paid</> : <><AlertCircle size={14} /> Pending</>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reference Links */}
                {viewProject.referenceLinks?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Reference Links
                    </h3>
                    <div className="space-y-1">
                      {viewProject.referenceLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm block truncate hover:underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div 
                className="p-4 border-t flex justify-end gap-3 sticky bottom-0"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              >
                <button
                  onClick={() => setViewProject(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Close
                </button>
                <Link
                  to={`/client/projects/${viewProject._id}`}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  View Full Details
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}