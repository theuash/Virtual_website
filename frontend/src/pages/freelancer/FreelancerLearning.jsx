import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import VideoPlayerModal from '../../components/VideoPlayerModal';
import {
  BookOpen, Play, Clock, ChevronRight,
  MessageSquare, User, Monitor, CheckCircle2, X,
} from 'lucide-react';
import api from '../../services/api';
import { motion } from 'framer-motion';

// ── Skill label map ───────────────────────────────────────────────
const SKILL_LABELS = {
  video_editing:     'Video Editing',
  '3d_animation':    '3D Animation',
  cgi:               'CGI / VFX',
  script_writing:    'Script Writing',
  graphic_designing: 'Graphic Design',
};

// ── Software options per skill ────────────────────────────────────
const SKILL_SOFTWARE = {
  video_editing:     ['davinci_resolve', 'adobe_premiere_pro', 'final_cut_pro', 'capcut'],
  '3d_animation':    ['blender', 'cinema_4d', 'maya', '3ds_max'],
  cgi:               ['after_effects', 'nuke', 'fusion', 'houdini'],
  script_writing:    ['final_draft', 'celtx', 'arc_studio', 'google_docs'],
  graphic_designing: ['adobe_photoshop', 'illustrator', 'figma', 'canva'],
};

// ── Software display names ─────────────────────────────────────
const SOFTWARE_LABELS = {
  davinci_resolve: 'DaVinci Resolve',
  adobe_premiere_pro: 'Adobe Premiere Pro',
  final_cut_pro: 'Final Cut Pro',
  capcut: 'CapCut',
  blender: 'Blender',
  cinema_4d: 'Cinema 4D',
  maya: 'Maya',
  '3ds_max': '3ds Max',
  after_effects: 'After Effects',
  nuke: 'Nuke',
  fusion: 'Fusion',
  houdini: 'Houdini',
  final_draft: 'Final Draft',
  celtx: 'Celtx',
  arc_studio: 'Arc Studio',
  google_docs: 'Google Docs',
  adobe_photoshop: 'Adobe Photoshop',
  illustrator: 'Illustrator',
  figma: 'Figma',
  canva: 'Canva',
};

// ── Tutorial Card ─────────────────────────────────────────────────
function TutorialCard({ tutorial, progress, onWatch }) {
  const isCompleted = progress?.completed;
  const pct = progress?.percentage || 0;

  return (
    <div
      className="p-4 rounded-lg border transition-all hover:border-accent"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {tutorial.title}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {tutorial.desc}
          </p>
        </div>
        {isCompleted && (
          <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} className="shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        <Clock size={12} />
        {tutorial.duration}
        <span>•</span>
        <span>{tutorial.level}</span>
      </div>

      {pct > 0 && (
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
        </div>
      )}

      <button
        onClick={() => onWatch(tutorial)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <Play size={10} strokeWidth={2} />
        {isCompleted ? 'Rewatch' : pct > 0 ? 'Continue' : 'Watch'}
      </button>
    </div>
  );
}

// ── Playlist Card ─────────────────────────────────────────────────
function PlaylistCard({ playlist, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onOpen(playlist)}
      className="p-4 rounded-lg border cursor-pointer transition-all"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {playlist.title}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {playlist.videos?.length || 0} videos
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
          {playlist.level}
        </span>
      </div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {playlist.description}
      </div>
    </motion.div>
  );
}

// ── Crash Course Card ─────────────────────────────────────────────
function CrashCourseCard({ course, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onOpen(course)}
      className="p-4 rounded-lg border cursor-pointer transition-all"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {course.title}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {course.videos?.length || 0} videos
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
          {course.level}
        </span>
      </div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {course.description}
      </div>
    </motion.div>
  );
}

// ── Playlist/Course Detail Modal ──────────────────────────────────
function PlaylistDetailModal({ item, onClose, onWatchVideo }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-secondary)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {item.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {item.videos?.length || 0} videos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-opacity-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Videos List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {item.videos && item.videos.length > 0 ? (
            item.videos.map((video, idx) => (
              <motion.div
                key={video.youtubeId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onWatchVideo(video)}
                className="p-3 rounded-lg border cursor-pointer transition-all hover:border-accent"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>
                    <Play size={12} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {video.title}
                    </h4>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                      {video.desc}
                    </p>
                    <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <Clock size={10} />
                      {video.duration}
                      <span>•</span>
                      <span>{video.level}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>No videos in this collection</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Supervisor Panel ──────────────────────────────────────────────
function SupervisorPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    api.get('/freelancer/supervisor')
      .then(res => setSupervisor(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMessageSupervisor = async () => {
    if (!supervisor) return;
    setMessaging(true);
    try {
      const res = await api.post('/messaging/conversations', {
        type:    'dm',
        members: [supervisor._id],
        name:    supervisor.fullName,
      });
      const convId = res.data?.data?._id;
      if (convId) {
        navigate(`/freelancer/messages?conv=${convId}`);
      }
    } catch {
      navigate('/freelancer/messages');
    } finally {
      setMessaging(false);
    }
  };

  const initials = supervisor?.fullName
    ? supervisor.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <Monitor size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Your Supervisor
        </h2>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        ) : !supervisor ? (
          <div className="py-6 text-center">
            <User size={28} strokeWidth={1} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              No supervisor assigned yet.
            </p>
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {initials}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {supervisor.fullName}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--accent)' }}>
                  Momentum Supervisor
                </div>
                {supervisor.department && (
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {supervisor.department.replace(/_/g, ' ')} dept.
                  </div>
                )}
              </div>
            </div>

            {/* Stats — only show if real data exists */}
            {(supervisor.totalReviews > 0 || supervisor.approvalRate > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center">
                  <div className="text-base font-black" style={{ color: 'var(--accent)' }}>{supervisor.totalReviews}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-black" style={{ color: 'var(--accent)' }}>{supervisor.approvalRate}%</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Approval</div>
                </div>
              </div>
            )}

            {/* Bio — only if set */}
            {supervisor.bio && (
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {supervisor.bio}
              </p>
            )}

            {/* Message */}
            <button
              onClick={handleMessageSupervisor}
              disabled={messaging}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <MessageSquare size={14} strokeWidth={1.5} />
              {messaging ? 'Opening chat...' : 'Message Supervisor'}
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="px-5 pb-5 space-y-2">
        <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
          Learning Tips
        </div>
        {[
          'Watch tutorials at 1.25x speed to save time.',
          'Practice each technique on a real client brief.',
          'Ask your supervisor to review your first deliverable.',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <ChevronRight size={12} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function FreelancerLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userSkills = [
    ...(user?.primarySkill ? [user.primarySkill] : []),
    ...(Array.isArray(user?.secondarySkills) ? user.secondarySkills : []),
  ].filter((s) => SKILL_LABELS[s]);

  const [activeSkill, setActiveSkill]         = useState(userSkills[0] || null);
  const [activeSoftware, setActiveSoftware]   = useState(
    userSkills[0] ? (SKILL_SOFTWARE[userSkills[0]]?.[0] ?? null) : null
  );
  const [progress, setProgress]               = useState({});
  const [playingTutorial, setPlayingTutorial] = useState(null);
  const [catalogue, setCatalogue]             = useState({});
  const [playlists, setPlaylists]             = useState([]);
  const [crashCourses, setCrashCourses]       = useState([]);
  const [videosLoading, setVideosLoading]     = useState(true);
  const [contentType, setContentType]         = useState('tutorials');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedCourse, setSelectedCourse]   = useState(null);

  // Fetch catalogue, playlists, crash courses, and progress on mount
  useEffect(() => {
    Promise.all([
      api.get('/learning/catalogue'),
      api.get('/freelancer/learning/progress'),
    ]).then(([catRes, progRes]) => {
      // Catalogue now has tutorials, playlists, crash_courses nested
      const rawCatalogue = catRes.data?.data ?? {};
      setCatalogue(rawCatalogue);
      setProgress(progRes.data?.data ?? {});
    }).catch((err) => {
      console.error('Error fetching catalogue:', err);
    }).finally(() => setVideosLoading(false));
  }, []);

  // Fetch playlists and crash courses when skill/software changes
  useEffect(() => {
    if (!activeSkill || !activeSoftware) return;

    Promise.all([
      api.get('/learning/playlists', { params: { skill: activeSkill, software: activeSoftware } }),
      api.get('/learning/crashcourses', { params: { skill: activeSkill, software: activeSoftware } }),
    ]).then(([playRes, courseRes]) => {
      setPlaylists(playRes.data?.data ?? []);
      setCrashCourses(courseRes.data?.data ?? []);
    }).catch(() => {});
  }, [activeSkill, activeSoftware]);

  function handleSkillChange(skill) {
    setActiveSkill(skill);
    setActiveSoftware(SKILL_SOFTWARE[skill]?.[0] ?? null);
  }

  const tutorials = (activeSoftware && activeSkill)
    ? (catalogue[activeSkill]?.[activeSoftware]?.tutorials ?? [])
    : [];

  // ── No skills set ─────────────────────────────────────────────
  if (userSkills.length === 0) {
    return (
      <>
        <DashboardHeader title="Learning" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BookOpen
            size={48}
            strokeWidth={1}
            className="mb-4"
            style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
          />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No skills set yet
          </h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Complete your profile to see personalised tutorials tailored to your skills.
          </p>
          <button
            onClick={() => navigate('/freelancer/settings')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <User size={14} strokeWidth={2} />
            Go to Settings
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Learning" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* ── Skill selector ────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {userSkills.map(skill => (
            <button
              key={skill}
              onClick={() => handleSkillChange(skill)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeSkill === skill ? 'scale-105' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                background: activeSkill === skill ? 'var(--accent)' : 'var(--bg-card)',
                color: activeSkill === skill ? '#fff' : 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
            >
              {SKILL_LABELS[skill]}
            </button>
          ))}
        </div>

        {/* ── Software selector ────────────────────────────────── */}
        {activeSkill && (
          <div className="flex flex-wrap gap-2">
            {SKILL_SOFTWARE[activeSkill]?.map(software => (
              <button
                key={software}
                onClick={() => setActiveSoftware(software)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeSoftware === software ? 'scale-105' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: activeSoftware === software ? 'var(--accent)' : 'transparent',
                  color: activeSoftware === software ? '#fff' : 'var(--text-primary)',
                  borderColor: activeSoftware === software ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {SOFTWARE_LABELS[software] || software}
              </button>
            ))}
          </div>
        )}

        {/* ── Content type selector ────────────────────────────── */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'tutorials', label: 'Tutorials' },
            { id: 'playlists', label: 'Playlists' },
            { id: 'crashcourses', label: 'Crash Courses' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setContentType(type.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                contentType === type.id ? 'border-accent' : 'border-transparent opacity-60'
              }`}
              style={{
                color: contentType === type.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* ── Main content grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Content area ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            {videosLoading ? (
              <SkeletonGrid count={6} />
            ) : (
              <div>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {contentType === 'tutorials' && `${SOFTWARE_LABELS[activeSoftware] || activeSoftware} - Tutorials`}
                      {contentType === 'playlists' && `${SOFTWARE_LABELS[activeSoftware] || activeSoftware} - Playlists`}
                      {contentType === 'crashcourses' && `${SOFTWARE_LABELS[activeSoftware] || activeSoftware} - Crash Courses`}
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {contentType === 'tutorials' && `${tutorials.length} lessons`}
                      {contentType === 'playlists' && `${playlists.length} playlists`}
                      {contentType === 'crashcourses' && `${crashCourses.length} courses`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                {contentType === 'tutorials' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tutorials.length > 0 ? (
                      tutorials.map(tutorial => (
                        <TutorialCard
                          key={tutorial.id}
                          tutorial={tutorial}
                          progress={progress[tutorial.id]}
                          onWatch={setPlayingTutorial}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p style={{ color: 'var(--text-secondary)' }}>No tutorials available</p>
                      </div>
                    )}
                  </div>
                ) : contentType === 'playlists' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {playlists.length > 0 ? (
                      playlists.map(playlist => (
                        <PlaylistCard
                          key={playlist._id}
                          playlist={playlist}
                          onOpen={setSelectedPlaylist}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p style={{ color: 'var(--text-secondary)' }}>No playlists available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {crashCourses.length > 0 ? (
                      crashCourses.map(course => (
                        <CrashCourseCard
                          key={course._id}
                          course={course}
                          onOpen={setSelectedCourse}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p style={{ color: 'var(--text-secondary)' }}>No crash courses available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Supervisor sidebar ────────────────────────────── */}
          <div className="lg:col-span-1">
            <SupervisorPanel />
          </div>

        </div>
      </div>

      {/* ── Video Player Modal ────────────────────────────────── */}
      {playingTutorial && (
        <VideoPlayerModal
          tutorial={{
            ...playingTutorial,
            id: playingTutorial.id || playingTutorial.youtubeId, // Use youtubeId as fallback id
          }}
          initialProgress={progress[playingTutorial.id || playingTutorial.youtubeId]}
          onClose={() => setPlayingTutorial(null)}
          onComplete={(tutorialId) => {
            setProgress(prev => ({
              ...prev,
              [tutorialId]: { ...(prev[tutorialId] ?? {}), completed: true },
            }));
          }}
        />
      )}

      {/* ── Playlist Detail Modal ─────────────────────────────── */}
      {selectedPlaylist && (
        <PlaylistDetailModal
          item={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
          onWatchVideo={(video) => {
            setPlayingTutorial(video);
            setSelectedPlaylist(null);
          }}
        />
      )}

      {/* ── Crash Course Detail Modal ─────────────────────────── */}
      {selectedCourse && (
        <PlaylistDetailModal
          item={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onWatchVideo={(video) => {
            setPlayingTutorial(video);
            setSelectedCourse(null);
          }}
        />
      )}
    </>
  );
}
