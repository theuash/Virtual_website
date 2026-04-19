import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { BookOpen, Play, Clock, MessageSquare, User, Monitor, X } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const SKILL_LABELS = {
  video_editing: 'Video Editing',
  '3d_animation': '3D Animation',
  cgi: 'CGI / VFX',
  script_writing: 'Script Writing',
  graphic_designing: 'Graphic Design',
};

const SKILL_SOFTWARE = {
  video_editing: ['davinci_resolve', 'adobe_premiere_pro', 'final_cut_pro', 'capcut'],
  '3d_animation': ['blender', 'cinema_4d', 'maya', '3ds_max'],
  cgi: ['after_effects', 'nuke', 'fusion', 'houdini'],
  script_writing: ['final_draft', 'celtx', 'arc_studio', 'google_docs'],
  graphic_designing: ['adobe_photoshop', 'illustrator', 'figma', 'canva'],
};

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

// Video Player
function VideoPlayer({ video }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', aspectRatio: '16/9' }}
    >
      <div className="relative w-full h-full bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{video.desc}</p>
      </div>
    </motion.div>
  );
}

// Video Card for recommendations
function VideoCard({ video, onClick, isSelected }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'ring-2' : ''}`}
      style={{
        background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
        color: isSelected ? '#fff' : 'var(--text-primary)',
      }}
    >
      <div className="flex items-start gap-2">
        <Play size={12} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold truncate">{video.title}</h4>
          <p className="text-[10px] mt-0.5 truncate opacity-80">{video.desc}</p>
          <div className="flex items-center gap-1 text-[10px] mt-1 opacity-70">
            <Clock size={10} />
            {video.duration}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Tutorial Card
function TutorialCard({ tutorial, onSelect, isSelected }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(tutorial, 'tutorial')}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'ring-2' : ''}`}
      style={{
        background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
        color: isSelected ? '#fff' : 'var(--text-primary)',
      }}
    >
      <h3 className="text-sm font-semibold">{tutorial.title}</h3>
      <p className="text-xs mt-1 opacity-80">{tutorial.desc}</p>
      <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
        <Clock size={12} />
        {tutorial.duration} • {tutorial.level}
      </div>
    </motion.div>
  );
}

// Playlist Card
function PlaylistCard({ playlist, onToggle, isExpanded, onSelectVideo }) {
  return (
    <div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => onToggle(playlist.id)}
        className="p-4 rounded-lg border cursor-pointer transition-all"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h3>
            <p className="text-xs mt-1 opacity-80">{playlist.videos?.length || 0} videos</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
            {playlist.level}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 pl-4 border-l-2"
            style={{ borderColor: 'var(--accent)' }}
          >
            {playlist.videos?.map((video) => (
              <motion.div
                key={video.youtubeId}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectVideo(video, 'playlist', playlist)}
                className="p-3 rounded-lg border cursor-pointer"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-2">
                  <Play size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h4>
                    <p className="text-[10px] mt-0.5 truncate opacity-80">{video.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Crash Course Card
function CrashCourseCard({ course, onToggle, isExpanded, onSelectVideo }) {
  return (
    <div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => onToggle(course.id)}
        className="p-4 rounded-lg border cursor-pointer transition-all"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
            <p className="text-xs mt-1 opacity-80">{course.videos?.length || 0} videos</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
            {course.level}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 pl-4 border-l-2"
            style={{ borderColor: 'var(--accent)' }}
          >
            {course.videos?.map((video) => (
              <motion.div
                key={video.youtubeId}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectVideo(video, 'crashcourse', course)}
                className="p-3 rounded-lg border cursor-pointer"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-2">
                  <Play size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h4>
                    <p className="text-[10px] mt-0.5 truncate opacity-80">{video.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Supervisor Panel
function SupervisorPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/freelancer/supervisor')
      .then(res => setSupervisor(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = supervisor?.fullName
    ? supervisor.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <Monitor size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Your Supervisor</h2>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        ) : !supervisor ? (
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No supervisor assigned</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black" style={{ background: 'var(--accent)', color: '#fff' }}>
                {initials}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{supervisor.fullName}</div>
                <div className="text-[11px]" style={{ color: 'var(--accent)' }}>Momentum Supervisor</div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>
              <MessageSquare size={14} />
              Message Supervisor
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function FreelancerLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userSkills = [
    ...(user?.primarySkill ? [user.primarySkill] : []),
    ...(Array.isArray(user?.secondarySkills) ? user.secondarySkills : []),
  ].filter((s) => SKILL_LABELS[s]);

  const [activeSkill, setActiveSkill] = useState(userSkills[0] || null);
  const [activeSoftware, setActiveSoftware] = useState(userSkills[0] ? (SKILL_SOFTWARE[userSkills[0]]?.[0] ?? null) : null);
  const [catalogue, setCatalogue] = useState({});
  const [videosLoading, setVideosLoading] = useState(true);
  const [contentType, setContentType] = useState('tutorials');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [sourceContext, setSourceContext] = useState(null);

  useEffect(() => {
    api.get('/learning/catalogue')
      .then(res => setCatalogue(res.data?.data ?? {}))
      .catch((err) => console.error('Error fetching catalogue:', err))
      .finally(() => setVideosLoading(false));
  }, []);

  const content = catalogue[activeSkill]?.[activeSoftware];
  const tutorials = content?.tutorials ?? [];
  const playlists = content?.playlists ?? [];
  const crashCourses = content?.crash_courses ?? [];

  const handleSelectVideo = (video, source, context = null) => {
    setSelectedVideo(video);
    setSelectedSource(source);
    setSourceContext(context);
  };

  const getRecommendations = () => {
    if (!selectedSource || !selectedVideo) return [];
    if (selectedSource === 'tutorial') {
      return tutorials.filter(t => t.youtubeId !== selectedVideo.youtubeId);
    } else if (selectedSource === 'playlist' && sourceContext) {
      return sourceContext.videos.filter(v => v.youtubeId !== selectedVideo.youtubeId);
    } else if (selectedSource === 'crashcourse' && sourceContext) {
      return sourceContext.videos.filter(v => v.youtubeId !== selectedVideo.youtubeId);
    }
    return [];
  };

  if (userSkills.length === 0) {
    return (
      <>
        <DashboardHeader title="Learning" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BookOpen size={48} strokeWidth={1} className="mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No skills set yet</h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>Complete your profile to see personalised tutorials.</p>
          <button onClick={() => navigate('/freelancer/settings')} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>
            <User size={14} />
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
        {/* Skill selector */}
        <div className="flex flex-wrap gap-2">
          {userSkills.map(skill => (
            <button
              key={skill}
              onClick={() => {
                setActiveSkill(skill);
                setActiveSoftware(SKILL_SOFTWARE[skill]?.[0] ?? null);
                setSelectedVideo(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeSkill === skill ? 'scale-105' : 'opacity-60'}`}
              style={{ background: activeSkill === skill ? 'var(--accent)' : 'var(--bg-card)', color: activeSkill === skill ? '#fff' : 'var(--text-primary)' }}
            >
              {SKILL_LABELS[skill]}
            </button>
          ))}
        </div>

        {/* Software selector */}
        {activeSkill && (
          <div className="flex flex-wrap gap-2">
            {SKILL_SOFTWARE[activeSkill]?.map(software => (
              <button
                key={software}
                onClick={() => {
                  setActiveSoftware(software);
                  setSelectedVideo(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeSoftware === software ? 'scale-105' : 'opacity-60'}`}
                style={{ background: activeSoftware === software ? 'var(--accent)' : 'transparent', color: activeSoftware === software ? '#fff' : 'var(--text-primary)', borderColor: activeSoftware === software ? 'var(--accent)' : 'var(--border)' }}
              >
                {SOFTWARE_LABELS[software] || software}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        {videosLoading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="space-y-6">
            {/* When video is selected - two column layout */}
            {selectedVideo ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left side - Video player */}
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Now Playing</h2>
                      <button onClick={() => setSelectedVideo(null)} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                      </button>
                    </div>
                    <VideoPlayer video={selectedVideo} />
                  </motion.div>
                </div>

                {/* Right side - Tabs and Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="lg:col-span-1 space-y-4"
                >
                  {/* Tabs - Horizontal and scrollable */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    {[
                      { id: 'tutorials', label: 'Tutorials' },
                      { id: 'playlists', label: 'Playlists' },
                      { id: 'crashcourses', label: 'Crash Courses' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                          contentType === type.id ? 'ring-2' : 'opacity-60'
                        }`}
                        style={{
                          background: contentType === type.id ? 'var(--accent)' : 'var(--bg-card)',
                          color: contentType === type.id ? '#fff' : 'var(--text-primary)',
                          borderColor: contentType === type.id ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Content based on selected tab */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {contentType === 'tutorials' ? (
                      <>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tutorials</h3>
                        {tutorials.length > 0 ? (
                          tutorials.map(tutorial => (
                            <VideoCard
                              key={tutorial.youtubeId}
                              video={tutorial}
                              onClick={() => handleSelectVideo(tutorial, 'tutorial')}
                              isSelected={selectedVideo.youtubeId === tutorial.youtubeId}
                            />
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-secondary)' }}>No tutorials available</p>
                        )}
                      </>
                    ) : contentType === 'playlists' ? (
                      <>
                        {/* Show expanded playlist if one is selected */}
                        {selectedSource === 'playlist' && sourceContext && (
                          <>
                            <div>
                              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>
                                {sourceContext.title}
                              </h3>
                              <div className="space-y-2 pl-2 border-l-2" style={{ borderColor: 'var(--accent)' }}>
                                {sourceContext.videos?.map(video => (
                                  <VideoCard
                                    key={video.youtubeId}
                                    video={video}
                                    onClick={() => handleSelectVideo(video, 'playlist', sourceContext)}
                                    isSelected={selectedVideo.youtubeId === video.youtubeId}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Other Playlists</h3>
                              {playlists.filter(p => p.id !== sourceContext.id).map(playlist => (
                                <motion.div
                                  key={playlist.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => handleSelectVideo(playlist.videos?.[0], 'playlist', playlist)}
                                  className="p-2 rounded-lg border cursor-pointer mb-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h4>
                                  <p className="text-[10px] opacity-70">{playlist.videos?.length || 0} videos</p>
                                </motion.div>
                              ))}
                            </div>
                          </>
                        )}
                        {/* Show all playlists if none selected */}
                        {selectedSource !== 'playlist' && (
                          <>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Playlists</h3>
                            {playlists.length > 0 ? (
                              playlists.map(playlist => (
                                <motion.div
                                  key={playlist.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => handleSelectVideo(playlist.videos?.[0], 'playlist', playlist)}
                                  className="p-2 rounded-lg border cursor-pointer"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h4>
                                  <p className="text-[10px] opacity-70">{playlist.videos?.length || 0} videos</p>
                                </motion.div>
                              ))
                            ) : (
                              <p style={{ color: 'var(--text-secondary)' }}>No playlists available</p>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Show expanded crash course if one is selected */}
                        {selectedSource === 'crashcourse' && sourceContext && (
                          <>
                            <div>
                              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>
                                {sourceContext.title}
                              </h3>
                              <div className="space-y-2 pl-2 border-l-2" style={{ borderColor: 'var(--accent)' }}>
                                {sourceContext.videos?.map(video => (
                                  <VideoCard
                                    key={video.youtubeId}
                                    video={video}
                                    onClick={() => handleSelectVideo(video, 'crashcourse', sourceContext)}
                                    isSelected={selectedVideo.youtubeId === video.youtubeId}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Other Courses</h3>
                              {crashCourses.filter(c => c.id !== sourceContext.id).map(course => (
                                <motion.div
                                  key={course.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => handleSelectVideo(course.videos?.[0], 'crashcourse', course)}
                                  className="p-2 rounded-lg border cursor-pointer mb-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                                  <p className="text-[10px] opacity-70">{course.videos?.length || 0} videos</p>
                                </motion.div>
                              ))}
                            </div>
                          </>
                        )}
                        {/* Show all crash courses if none selected */}
                        {selectedSource !== 'crashcourse' && (
                          <>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Crash Courses</h3>
                            {crashCourses.length > 0 ? (
                              crashCourses.map(course => (
                                <motion.div
                                  key={course.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => handleSelectVideo(course.videos?.[0], 'crashcourse', course)}
                                  className="p-2 rounded-lg border cursor-pointer"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                                  <p className="text-[10px] opacity-70">{course.videos?.length || 0} videos</p>
                                </motion.div>
                              ))
                            ) : (
                              <p style={{ color: 'var(--text-secondary)' }}>No crash courses available</p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              /* When no video selected - show content grid */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side - Content grid */}
                <div className="lg:col-span-2">
                  {/* Content type tabs */}
                  <div className="flex gap-2 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
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

                  {/* Content grid */}
                  {contentType === 'tutorials' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tutorials.length > 0 ? (
                        tutorials.map(tutorial => (
                          <TutorialCard
                            key={tutorial.id}
                            tutorial={tutorial}
                            onSelect={handleSelectVideo}
                            isSelected={selectedVideo?.youtubeId === tutorial.youtubeId && selectedSource === 'tutorial'}
                          />
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No tutorials available</p>
                      )}
                    </div>
                  ) : contentType === 'playlists' ? (
                    <div className="space-y-3">
                      {playlists.length > 0 ? (
                        playlists.map(playlist => (
                          <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onToggle={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                            isExpanded={expandedPlaylist === playlist.id}
                            onSelectVideo={(video, source, context) => handleSelectVideo(video, source, context)}
                          />
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No playlists available</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {crashCourses.length > 0 ? (
                        crashCourses.map(course => (
                          <CrashCourseCard
                            key={course.id}
                            course={course}
                            onToggle={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                            isExpanded={expandedCourse === course.id}
                            onSelectVideo={(video, source, context) => handleSelectVideo(video, source, context)}
                          />
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No crash courses available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side - Supervisor */}
                <SupervisorPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
