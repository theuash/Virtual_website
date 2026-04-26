import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { BookOpen, Play, Clock, MessageSquare, User, Monitor, X, CheckCircle, TrendingUp, Award, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../../context/SidebarContext';

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

// â”€â”€ YouTube IFrame API progress-tracking player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Uses the YouTube IFrame API to poll playback position every 5s and
// report to the backend. A video is "complete" once 80% is watched.
let ytApiReady = false;
const ytApiCallbacks = [];

function ensureYTApi() {
  if (window.YT && window.YT.Player) { ytApiReady = true; return; }
  if (document.getElementById('yt-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytApiCallbacks.forEach(cb => cb());
    ytApiCallbacks.length = 0;
  };
}

function VideoPlayer({ video, onProgressUpdate, progressMap }) {
  const containerRef  = useRef(null);
  const wrapperRef    = useRef(null);
  const playerRef     = useRef(null);
  const intervalRef   = useRef(null);
  const reportedRef   = useRef(false);
  const videoIdRef    = useRef(video?.youtubeId);

  const isCompleted = progressMap?.[video?.youtubeId]?.completed;
  // Resume from last saved position (if > 5s and not completed)
  const resumeAt = (() => {
    const p = progressMap?.[video?.youtubeId];
    if (!p || p.completed) return 0;
    return p.lastPosition > 5 ? p.lastPosition : 0;
  })();

  const startPolling = useCallback((player) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const state    = player.getPlayerState();
        // 1 = playing
        if (state !== 1) return;
        const current  = player.getCurrentTime();
        const duration = player.getDuration();
        if (!duration || duration <= 0) return;

        const pct = current / duration;
        onProgressUpdate?.({ youtubeId: video.youtubeId, current, duration, pct });

        // Report to backend every 5s
        await api.post('/freelancer/learning/progress', {
          tutorialId:      video.youtubeId,
          watchedSeconds:  Math.floor(current),
          durationSeconds: Math.floor(duration),
          lastPosition:    Math.floor(current),
        });
      } catch { /* silent */ }
    }, 5000);
  }, [video?.youtubeId, onProgressUpdate]);

  useEffect(() => {
    ensureYTApi();
    videoIdRef.current = video?.youtubeId;
    reportedRef.current = false;

    const buildPlayer = () => {
      if (!containerRef.current) return;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      const div = document.createElement('div');
      div.id = `yt-player-${video.youtubeId}-${Date.now()}`;
      div.style.width = '100%';
      div.style.height = '100%';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div.id, {
        videoId: video.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, start: Math.floor(resumeAt) },
        events: {
          onReady: (e) => {
            // Force the injected iframe to fill the absolutely-positioned container
            const iframe = e.target.getIframe();
            if (iframe) {
              iframe.style.position = 'absolute';
              iframe.style.top = '0';
              iframe.style.left = '0';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
            }
            startPolling(e.target);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) startPolling(e.target);
          },
        },
      });
    };

    if (ytApiReady) {
      buildPlayer();
    } else {
      ytApiCallbacks.push(buildPlayer);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    };
  }, [video?.youtubeId]);

  // Re-apply iframe fill styles whenever the wrapper is resized (e.g. sidebar collapse/expand).
  // The YouTube IFrame API bakes in pixel dimensions — ResizeObserver catches the reflow.
  useEffect(() => {
    if (!wrapperRef.current) return;
    const applyFill = () => {
      try {
        const iframe = playerRef.current?.getIframe?.();
        if (iframe) {
          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
        }
      } catch { /* ignore */ }
    };
    const ro = new ResizeObserver(applyFill);
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Official YouTube IFrame player â€” full controls, HD quality */}
      {/* Padding-top 56.25% = 16:9 aspect ratio — iframe fills the container absolutely */}
      <div ref={wrapperRef} style={{ position: 'relative', paddingTop: '56.25%', width: '100%', background: '#000' }}>
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
      <div className="p-4 border-t flex items-start justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{video.desc}</p>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full shrink-0" style={{ background: '#16a34a22', color: '#16a34a' }}>
            <CheckCircle size={12} /> Completed
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Video Card for recommendations
function VideoCard({ video, onClick, isSelected }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`rounded-lg border cursor-pointer transition-all overflow-hidden ${isSelected ? 'ring-2' : ''}`}
      style={{
        background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
        color: isSelected ? '#fff' : 'var(--text-primary)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={24} className="text-white" fill="white" />
        </div>
      </div>
      
      {/* Info */}
      <div className="p-2">
        <h4 className="text-xs font-semibold truncate">{video.title}</h4>
        <p className="text-[10px] mt-0.5 truncate opacity-80">{video.desc}</p>
        <div className="flex items-center gap-1 text-[10px] mt-1 opacity-70">
          <Clock size={10} />
          {video.duration}
        </div>
      </div>
    </motion.div>
  );
}

// Tutorial Card
function TutorialCard({ tutorial, onSelect, isSelected, isCompleted }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${tutorial.youtubeId}/maxresdefault.jpg`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(tutorial, 'tutorial')}
      className={`rounded-lg border cursor-pointer transition-all overflow-hidden ${isSelected ? 'ring-2' : ''}`}
      style={{
        background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--accent)' : isCompleted ? '#16a34a' : 'var(--border)',
        color: isSelected ? '#fff' : 'var(--text-primary)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <img
          src={thumbnailUrl}
          alt={tutorial.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={32} className="text-white" fill="white" />
        </div>
        {isCompleted && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#16a34a', color: '#fff' }}>
            <CheckCircle size={10} /> Done
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">{tutorial.title}</h3>
        <p className="text-xs mt-1 opacity-80 line-clamp-2">{tutorial.desc}</p>
        <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
          <Clock size={12} />
          {tutorial.duration} â€¢ {tutorial.level}
        </div>
      </div>
    </motion.div>
  );
}

// Playlist Card - Compact
function PlaylistCard({ playlist, onToggle, isExpanded, onSelectVideo }) {
  const firstVideoThumbnail = playlist.videos?.[0]?.youtubeId 
    ? `https://img.youtube.com/vi/${playlist.videos[0].youtubeId}/maxresdefault.jpg`
    : null;
  
  const handleClick = () => {
    // Play the first video from the playlist
    if (playlist.videos?.[0]) {
      onSelectVideo(playlist.videos[0], 'playlist', playlist);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className="rounded-lg border cursor-pointer transition-all overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Thumbnail */}
      {firstVideoThumbnail && (
        <div className="relative w-full aspect-video overflow-hidden bg-black">
          <img
            src={firstVideoThumbnail}
            alt={playlist.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </div>
      )}
      
      {/* Info */}
      <div className="p-2">
        <h3 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h3>
        <p className="text-[10px] mt-0.5 opacity-80">{playlist.videos?.length || 0} videos</p>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--accent)', color: '#fff' }}>
          {playlist.level}
        </span>
      </div>
    </motion.div>
  );
}

// Crash Course Card - Compact
function CrashCourseCard({ course, onToggle, isExpanded, onSelectVideo }) {
  const firstVideoThumbnail = course.videos?.[0]?.youtubeId 
    ? `https://img.youtube.com/vi/${course.videos[0].youtubeId}/maxresdefault.jpg`
    : null;
  
  const handleClick = () => {
    // Play the first video from the crash course
    if (course.videos?.[0]) {
      onSelectVideo(course.videos[0], 'crashcourse', course);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className="rounded-lg border cursor-pointer transition-all overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Thumbnail */}
      {firstVideoThumbnail && (
        <div className="relative w-full aspect-video overflow-hidden bg-black">
          <img
            src={firstVideoThumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </div>
      )}
      
      {/* Info */}
      <div className="p-2">
        <h3 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
        <p className="text-[10px] mt-0.5 opacity-80">{course.videos?.length || 0} videos</p>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--accent)', color: '#fff' }}>
          {course.level}
        </span>
      </div>
    </motion.div>
  );
}

// ── Promotion Progress Panel ──────────────────────────────────────────
function PromotionProgressPanel({ onApplied }) {
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/freelancer/learning/promotion-status');
      setStatus(res.data?.data);
      if (res.data?.data?.alreadyApplied) setApplied(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/freelancer/learning/apply-promotion');
      setApplied(true);
      onApplied?.();
      await fetchStatus();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const REQUIREMENTS = { Beginner: 12, Intermediate: 10, Advanced: 8 };
  const LEVEL_COLORS = {
    Beginner:     { bar: '#22c55e', bg: '#22c55e22', text: '#16a34a' },
    Intermediate: { bar: '#f59e0b', bg: '#f59e0b22', text: '#b45309' },
    Advanced:     { bar: '#ef4444', bg: '#ef444422', text: '#dc2626' },
  };

  // Build sorted software rows from softwareStats (best total first)
  const softwareRows = status?.softwareStats
    ? Object.values(status.softwareStats).sort((a, b) => {
        const scoreA = (a.Beginner ?? 0) + (a.Intermediate ?? 0) + (a.Advanced ?? 0);
        const scoreB = (b.Beginner ?? 0) + (b.Intermediate ?? 0) + (b.Advanced ?? 0);
        return scoreB - scoreA;
      })
    : [];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Header row — always visible */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <div className="flex items-center gap-2 shrink-0">
          <TrendingUp size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Crate Promotion</h2>
        </div>

        {/* Compact inline progress bars */}
        {!loading && status && (
          <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
            {['Beginner', 'Intermediate', 'Advanced'].map(level => {
              const current  = status.progress?.[level] ?? 0;
              const required = REQUIREMENTS[level];
              const pct      = Math.min(100, Math.round((current / required) * 100));
              const done     = current >= required;
              const colors   = LEVEL_COLORS[level];
              return (
                <div key={level} className="flex items-center gap-2 min-w-[130px]">
                  <span className="text-[10px] font-semibold shrink-0 w-24"
                    style={{ color: done ? colors.text : 'var(--text-secondary)' }}>
                    {level} {done ? '\u2713' : `${current}/${required}`}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)', minWidth: 60 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: colors.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && status && (
            applied ? (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#16a34a22', color: '#16a34a' }}>
                <Award size={12} /> Submitted
              </span>
            ) : status.eligible ? (
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#fff', opacity: applying ? 0.7 : 1 }}
              >
                <Award size={12} />
                {applying ? 'Applying...' : 'Apply'}
              </button>
            ) : null
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
            title={expanded ? 'Hide software breakdown' : 'View per-software progress'}
          >
            <ChevronRight size={13} strokeWidth={2}
              style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expandable per-software breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 py-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                  ))}
                </div>
              ) : softwareRows.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
                  No progress data yet — start watching videos!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left pb-2 pr-4 font-semibold"
                          style={{ color: 'var(--text-secondary)' }}>Software</th>
                        {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                          <th key={level} className="text-center pb-2 px-3 font-semibold whitespace-nowrap"
                            style={{ color: LEVEL_COLORS[level].text }}>
                            {level.slice(0, 3)}
                          </th>
                        ))}
                        <th className="text-center pb-2 px-3 font-semibold"
                          style={{ color: 'var(--text-secondary)' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {softwareRows.map((row, i) => {
                        const total = (row.Beginner ?? 0) + (row.Intermediate ?? 0) + (row.Advanced ?? 0);
                        const isBest = (level) => status?.bestSoftware?.[level] === row.software;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)22' }}>
                            <td className="py-2 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                              {SOFTWARE_LABELS[row.software] || row.software.replace(/_/g, ' ')}
                              <span className="ml-1 text-[9px] opacity-50">
                                {SKILL_LABELS[row.skill] || row.skill}
                              </span>
                            </td>
                            {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                              const val  = row[level] ?? 0;
                              const req  = REQUIREMENTS[level];
                              const best = isBest(level);
                              return (
                                <td key={level} className="text-center py-2 px-3">
                                  <span
                                    className="inline-flex items-center justify-center w-10 h-5 rounded font-bold text-[10px]"
                                    style={{
                                      background: best ? LEVEL_COLORS[level].bg : val > 0 ? 'var(--bg-card)' : 'transparent',
                                      color: best ? LEVEL_COLORS[level].text : val > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                      border: best ? `1px solid ${LEVEL_COLORS[level].bar}` : '1px solid transparent',
                                    }}
                                    title={best ? `Best for ${level} — counts toward promotion` : undefined}
                                  >
                                    {val}/{req}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="text-center py-2 px-3 font-bold"
                              style={{ color: total > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-[10px] mt-3" style={{ color: 'var(--text-secondary)' }}>
                    Highlighted = best software per level (counts toward promotion). Requirements: Beg {REQUIREMENTS.Beginner} · Int {REQUIREMENTS.Intermediate} · Adv {REQUIREMENTS.Advanced}
                  </p>
                </div>
              )}
            </div>
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
  const { setCollapsed: setNavCollapsed } = useSidebar();

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
  const [catalogueError, setCatalogueError] = useState(null);

  // Progress tracking: { [youtubeId]: { completed, watchedSeconds, durationSeconds } }
  const [progressMap, setProgressMap] = useState({});
  const promotionPanelRef = useRef(null);

  // Fetch existing progress on mount
  useEffect(() => {
    api.get('/freelancer/learning/progress')
      .then(res => setProgressMap(res.data?.data ?? {}))
      .catch(() => {});
  }, []);

  // Called by VideoPlayer every 5s with live playback info
  const handleProgressUpdate = useCallback(({ youtubeId, current, duration, pct }) => {
    setProgressMap(prev => {
      const existing = prev[youtubeId] ?? {};
      const alreadyDone = existing.completed;
      const nowDone = !alreadyDone && pct >= 0.8;
      return {
        ...prev,
        [youtubeId]: {
          ...existing,
          watchedSeconds:  Math.max(existing.watchedSeconds ?? 0, Math.floor(current)),
          durationSeconds: Math.floor(duration),
          completed:       alreadyDone || nowDone,
        },
      };
    });
  }, []);

  // When user data loads/refreshes (e.g. after /auth/me), sync active skill if not set yet
  useEffect(() => {
    if (userSkills.length > 0 && !activeSkill) {
      setActiveSkill(userSkills[0]);
      setActiveSoftware(SKILL_SOFTWARE[userSkills[0]]?.[0] ?? null);
    }
  }, [user]);

  useEffect(() => {
    api.get('/learning/catalogue')
      .then(res => {
        const raw = res.data?.data ?? {};
        // Normalize: each skill/software value might be a plain object {tutorials,playlists,crash_courses}
        // OR an array of full documents (old backend format) ΓÇö handle both
        const normalized = {};
        for (const skill of Object.keys(raw)) {
          normalized[skill] = {};
          for (const software of Object.keys(raw[skill])) {
            const val = raw[skill][software];
            if (Array.isArray(val)) {
              // Old format: array of documents ΓÇö merge all into one
              normalized[skill][software] = {
                tutorials: val.flatMap(d => d.tutorials ?? []),
                playlists: val.flatMap(d => d.playlists ?? []),
                crash_courses: val.flatMap(d => d.crash_courses ?? []),
              };
            } else {
              normalized[skill][software] = {
                tutorials: val.tutorials ?? [],
                playlists: val.playlists ?? [],
                crash_courses: val.crash_courses ?? [],
              };
            }
          }
        }
        console.log('[Learning] normalized catalogue:', JSON.stringify(Object.keys(normalized)));
        setCatalogue(normalized);
      })
      .catch((err) => {
        console.error('Error fetching catalogue:', err);
        setCatalogueError(err?.response?.data?.message || err?.message || 'Unknown error');
      })
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
    setNavCollapsed(true);  // collapse nav sidebar for more space
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
        <PromotionProgressPanel onApplied={() => {}} />

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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left side - Video player */}
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Now Playing</h2>
                      <button onClick={() => { setSelectedVideo(null); setNavCollapsed(false); }} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                      </button>
                    </div>
                    <VideoPlayer video={selectedVideo} onProgressUpdate={handleProgressUpdate} progressMap={progressMap} />
                  </motion.div>
                </div>

                {/* Right side - Tabs and Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="lg:col-span-2 space-y-4 flex flex-col"
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
                            <motion.div
                              key={tutorial.youtubeId}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleSelectVideo(tutorial, 'tutorial')}
                              className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden transition-all p-2"
                              style={{
                                background: selectedVideo?.youtubeId === tutorial.youtubeId ? 'var(--accent)' : 'var(--bg-card)',
                                borderColor: selectedVideo?.youtubeId === tutorial.youtubeId ? 'var(--accent)' : progressMap[tutorial.youtubeId]?.completed ? '#16a34a' : 'var(--border)',
                              }}
                            >
                              {/* Thumbnail */}
                              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                <img
                                  src={`https://img.youtube.com/vi/${tutorial.youtubeId}/maxresdefault.jpg`}
                                  alt={tutorial.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play size={12} className="text-white" fill="white" />
                                </div>
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold line-clamp-2" style={{ color: selectedVideo?.youtubeId === tutorial.youtubeId ? '#fff' : 'var(--text-primary)' }}>{tutorial.title}</h4>
                                <p className="text-[10px] mt-0.5 opacity-80">{tutorial.duration}</p>
                                {progressMap[tutorial.youtubeId]?.completed && (
                                  <span className="text-[9px] font-bold" style={{ color: '#16a34a' }}>Γ£ô Completed</span>
                                )}
                              </div>
                            </motion.div>
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
                              <div className="space-y-2">
                                {sourceContext.videos?.map(video => (
                                  <motion.div
                                    key={video.youtubeId}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleSelectVideo(video, 'playlist', sourceContext)}
                                    className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden transition-all p-2"
                                    style={{
                                      background: selectedVideo?.youtubeId === video.youtubeId ? 'var(--accent)' : 'var(--bg-card)',
                                      borderColor: selectedVideo?.youtubeId === video.youtubeId ? 'var(--accent)' : 'var(--border)',
                                    }}
                                  >
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                      <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play size={12} className="text-white" fill="white" />
                                      </div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-semibold line-clamp-2" style={{ color: selectedVideo?.youtubeId === video.youtubeId ? '#fff' : 'var(--text-primary)' }}>{video.title}</h4>
                                      <p className="text-[10px] mt-0.5 opacity-80">{video.duration}</p>
                                    </div>
                                  </motion.div>
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
                                  className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden mb-2 transition-all p-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                    <img
                                      src={`https://img.youtube.com/vi/${playlist.videos?.[0]?.youtubeId}/maxresdefault.jpg`}
                                      alt={playlist.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play size={12} className="text-white" fill="white" />
                                    </div>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h4>
                                    <p className="text-[10px] opacity-70">{playlist.videos?.length || 0} videos</p>
                                  </div>
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
                                  className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden transition-all p-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                    <img
                                      src={`https://img.youtube.com/vi/${playlist.videos?.[0]?.youtubeId}/maxresdefault.jpg`}
                                      alt={playlist.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play size={12} className="text-white" fill="white" />
                                    </div>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{playlist.title}</h4>
                                    <p className="text-[10px] opacity-70">{playlist.videos?.length || 0} videos</p>
                                  </div>
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
                              <div className="space-y-2">
                                {sourceContext.videos?.map(video => (
                                  <motion.div
                                    key={video.youtubeId}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleSelectVideo(video, 'crashcourse', sourceContext)}
                                    className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden transition-all p-2"
                                    style={{
                                      background: selectedVideo?.youtubeId === video.youtubeId ? 'var(--accent)' : 'var(--bg-card)',
                                      borderColor: selectedVideo?.youtubeId === video.youtubeId ? 'var(--accent)' : 'var(--border)',
                                    }}
                                  >
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                      <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play size={12} className="text-white" fill="white" />
                                      </div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-semibold line-clamp-2" style={{ color: selectedVideo?.youtubeId === video.youtubeId ? '#fff' : 'var(--text-primary)' }}>{video.title}</h4>
                                      <p className="text-[10px] mt-0.5 opacity-80">{video.duration}</p>
                                    </div>
                                  </motion.div>
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
                                  className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden mb-2 transition-all p-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                    <img
                                      src={`https://img.youtube.com/vi/${course.videos?.[0]?.youtubeId}/maxresdefault.jpg`}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play size={12} className="text-white" fill="white" />
                                    </div>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                                    <p className="text-[10px] opacity-70">{course.videos?.length || 0} videos</p>
                                  </div>
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
                                  className="flex gap-2 rounded-lg border cursor-pointer overflow-hidden transition-all p-2"
                                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-black rounded">
                                    <img
                                      src={`https://img.youtube.com/vi/${course.videos?.[0]?.youtubeId}/maxresdefault.jpg`}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play size={12} className="text-white" fill="white" />
                                    </div>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                                    <p className="text-[10px] opacity-70">{course.videos?.length || 0} videos</p>
                                  </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tutorials.length > 0 ? (
                        tutorials.map(tutorial => (
                          <TutorialCard
                            key={tutorial.id}
                            tutorial={tutorial}
                            onSelect={handleSelectVideo}
                            isSelected={selectedVideo?.youtubeId === tutorial.youtubeId && selectedSource === 'tutorial'}
                            isCompleted={!!progressMap[tutorial.youtubeId]?.completed}
                          />
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No tutorials available</p>
                      )}
                    </div>
                  ) : contentType === 'playlists' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <div className="space-y-4">
                  <SupervisorPanel />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
