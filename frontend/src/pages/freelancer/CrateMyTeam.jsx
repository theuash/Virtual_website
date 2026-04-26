import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';
import {
  Users, Star, Briefcase, MessageSquare, Loader2,
  AlertCircle, ChevronRight, Tag, Calendar, UserCheck,
} from 'lucide-react';

const SKILL_LABELS = {
  video_editing:    'Video Editing',
  '3d_animation':   '3D Animation',
  cgi:              'CGI / VFX',
  script_writing:   'Script Writing',
  graphic_designing:'Graphic Design',
};

const TIER_COLORS = {
  precrate:           '#6b7280',
  crate:              '#3b82f6',
  project_initiator:  '#8b5cf6',
  momentum_supervisor:'#f59e0b',
};

function Avatar({ name, size = 10, tier }) {
  const color = TIER_COLORS[tier] || 'var(--accent)';
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-black shrink-0`}
      style={{ background: color, color: '#fff' }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function InitiatorCard({ initiator }) {
  const navigate = useNavigate();

  const handleMessage = async () => {
    try {
      const res = await api.post(`/crate/freelancers/${initiator._id}/message`);
      navigate(`/freelancer/messages?conv=${res.data?.data?.conversationId}`);
    } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Purple accent for initiator */}
      <div className="h-1 w-full" style={{ background: '#8b5cf6' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={initiator.fullName} size={12} tier="project_initiator" />
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{initiator.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: '#8b5cf622', color: '#8b5cf6' }}
              >
                Project Initiator
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={12} />
            {SKILL_LABELS[initiator.primarySkill] || initiator.primarySkill || '-'}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <UserCheck size={12} />
            {initiator.email}
          </div>
        </div>

        <button
          onClick={handleMessage}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#8b5cf6', color: '#fff' }}
        >
          <MessageSquare size={14} />
          Message Initiator
        </button>
      </div>
    </motion.div>
  );
}

function MemberCard({ member, isMe }) {
  const navigate = useNavigate();

  const handleMessage = async () => {
    if (isMe) return;
    try {
      const res = await api.post(`/crate/freelancers/${member._id}/message`);
      navigate(`/freelancer/messages?conv=${res.data?.data?.conversationId}`);
    } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl border transition-all"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <Avatar name={member.fullName} size={9} tier={member.tier} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {member.fullName}
          </p>
          {isMe && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: 'var(--accent)', color: '#fff' }}>
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {SKILL_LABELS[member.primarySkill] || '-'}
          </span>
          {member.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#f59e0b' }}>
              <Star size={9} fill="#f59e0b" /> {member.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      {!isMe && (
        <button
          onClick={handleMessage}
          className="p-2 rounded-lg border transition-all hover:scale-105"
          style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: 'var(--bg-secondary)' }}
          title="Message"
        >
          <MessageSquare size={13} strokeWidth={1.5} />
        </button>
      )}
    </motion.div>
  );
}

function TeamCard({ team, currentUserId }) {
  const statusColors = {
    open:         '#3b82f6',
    in_progress:  '#f59e0b',
    under_review: '#8b5cf6',
    completed:    '#10b981',
    cancelled:    '#ef4444',
  };
  const projectColor = statusColors[team.projectId?.status] || '#6b7280';

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Project header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', borderLeft: `3px solid ${projectColor}` }}>
        <Briefcase size={16} strokeWidth={1.5} style={{ color: projectColor }} />
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {team.projectId?.title || 'Unnamed Project'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {SKILL_LABELS[team.projectId?.category] || ''}
            </span>
            {team.projectId?.deadline && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={9} />
                {new Date(team.projectId.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Initiator */}
        {team.initiatorId && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              Project Initiator
            </p>
            <InitiatorCard initiator={team.initiatorId} />
          </div>
        )}

        {/* Team members */}
        {team.members?.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              Team Members ({team.members.length})
            </p>
            <div className="space-y-2">
              {team.members.map(member => (
                <MemberCard
                  key={member._id}
                  member={member}
                  isMe={member._id?.toString() === currentUserId?.toString()}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrateMyTeam() {
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const { user } = { user: JSON.parse(localStorage.getItem('virtual_user') || '{}') };

  useEffect(() => {
    api.get('/crate/team')
      .then(res => setTeams(res.data?.data ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load team'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardHeader title="My Team" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Info banner */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <Users size={16} strokeWidth={1.5} style={{ color: 'var(--accent)', marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Project Teams</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Each team is tied to a specific project. Your Project Initiator manages task assignments and project direction.
              You can message your initiator or teammates directly.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-3" style={{ color: '#ef4444', opacity: 0.6 }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={40} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Not assigned to any team yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Once a Project Initiator adds you to a project team, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {teams.map(team => (
              <TeamCard key={team._id} team={team} currentUserId={user?._id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
