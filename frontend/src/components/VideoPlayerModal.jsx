import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';

// ── YouTube IFrame API loader (singleton) ────────────────────────
let ytApiReady = false;
let ytApiCallbacks = [];

function loadYouTubeAPI() {
  if (ytApiReady) return Promise.resolve();
  return new Promise((resolve) => {
    ytApiCallbacks.push(resolve);
    if (document.getElementById('yt-iframe-api')) return; // already loading
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true;
      ytApiCallbacks.forEach(cb => cb());
      ytApiCallbacks = [];
    };
  });
}

// ── Extract YouTube video ID from a search query ─────────────────
// We use the YouTube oEmbed endpoint to resolve a search query to a video ID.
// Since we only have search queries (not direct IDs), we embed a search results
// page via the YouTube IFrame API's playlist search feature.
// Actually — we'll use the YouTube Data API-free approach:
// embed as a playlist search using the IFrame API's "listType: search" feature.

const COMPLETION_THRESHOLD = 0.80; // 80% watched = complete
const REPORT_INTERVAL_MS   = 5000; // report progress every 5 seconds

/**
 * VideoPlayerModal
 *
 * Props:
 *   tutorial  — { id, title, desc, duration, level, youtubeQuery }
 *   onClose   — () => void
 *   onComplete — (tutorialId) => void  — called when 80% threshold crossed
 *   initialProgress — { watchedSeconds, durationSeconds, completed, lastPosition }
 */
export default function VideoPlayerModal({ tutorial, onClose, onComplete, initialProgress }) {
  const playerRef    = useRef(null);
  const playerDivRef = useRef(null);
  const intervalRef  = useRef(null);
  const watchedRef   = useRef(initialProgress?.watchedSeconds ?? 0);
  const lastPosRef   = useRef(initialProgress?.lastPosition ?? 0);
  const completedRef = useRef(initialProgress?.completed ?? false);

  const [playerReady, setPlayerReady] = useState(false);
  const [duration, setDuration]       = useState(initialProgress?.durationSeconds ?? 0);
  const [watched, setWatched]         = useState(initialProgress?.watchedSeconds ?? 0);
  const [completed, setCompleted]     = useState(initialProgress?.completed ?? false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError]             = useState(null);

  const pct = duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;

  // ── Report progress to backend ──────────────────────────────────
  const reportProgress = useCallback(async (force = false) => {
    if (!playerRef.current || !tutorial?.id) return;
    try {
      const currentTime = playerRef.current.getCurrentTime?.() ?? 0;
      const dur         = playerRef.current.getDuration?.()    ?? 0;

      // Accumulate unique watched seconds (don't decrease)
      const newWatched = Math.max(watchedRef.current, currentTime);
      watchedRef.current = newWatched;
      lastPosRef.current = currentTime;

      setWatched(newWatched);
      if (dur > 0) setDuration(dur);

      const res = await api.post('/freelancer/learning/progress', {
        tutorialId:      tutorial.id,
        watchedSeconds:  Math.round(newWatched),
        durationSeconds: Math.round(dur),
        lastPosition:    Math.round(currentTime),
      });

      if (res.data?.data?.justCompleted && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        setJustCompleted(true);
        onComplete?.(tutorial.id);
      }
    } catch {
      // Silent — don't interrupt the user's viewing
    }
  }, [tutorial?.id, onComplete]);

  // ── Init YouTube player ─────────────────────────────────────────
  useEffect(() => {
    if (!tutorial) return;

    loadYouTubeAPI().then(() => {
      if (!playerDivRef.current) return;

      playerRef.current = new window.YT.Player(playerDivRef.current, {
        height: '100%',
        width:  '100%',
        playerVars: {
          listType:   'search',
          list:       tutorial.youtubeQuery,
          autoplay:   1,
          rel:        0,
          modestbranding: 1,
          iv_load_policy: 3,
          start: Math.floor(initialProgress?.lastPosition ?? 0),
        },
        events: {
          onReady: (e) => {
            setPlayerReady(true);
            const dur = e.target.getDuration();
            if (dur > 0) setDuration(dur);
          },
          onStateChange: (e) => {
            // YT.PlayerState.PLAYING = 1
            if (e.data === 1) {
              // Start polling
              if (!intervalRef.current) {
                intervalRef.current = setInterval(() => reportProgress(), REPORT_INTERVAL_MS);
              }
            } else {
              // Paused / ended / buffering — report once and stop polling
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              reportProgress(true);
            }
          },
          onError: () => {
            setError('Could not load the video. Try again or search on YouTube directly.');
          },
        },
      });
    });

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      reportProgress(true);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial?.id]);

  const handleClose = () => {
    clearInterval(intervalRef.current);
    reportProgress(true);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="w-full max-w-4xl rounded-2xl overflow-hidden border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          initial={{ scale: 0.92, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {tutorial.title}
                </h2>
                {completed && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    <CheckCircle2 size={9} strokeWidth={2.5} /> Complete
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><Clock size={10} /> {tutorial.duration}</span>
                <span>{tutorial.level}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg border transition-all hover:scale-105 shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>

          {/* ── Video ──────────────────────────────────────────── */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {!playerReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            )}
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tutorial.youtubeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  Search on YouTube →
                </a>
              </div>
            ) : (
              <div ref={playerDivRef} className="w-full h-full" />
            )}
          </div>

          {/* ── Progress bar ───────────────────────────────────── */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Watch Progress
              </span>
              <span className="text-[10px] font-black" style={{ color: completed ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {pct}% {completed ? '— Complete ✓' : `— need ${Math.round(COMPLETION_THRESHOLD * 100)}% to complete`}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: completed ? 'var(--accent)' : 'var(--accent)', opacity: completed ? 1 : 0.7 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Completion toast */}
            <AnimatePresence>
              {justCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(96,10,10,0.1)', border: '1px solid var(--accent)' }}
                >
                  <CheckCircle2 size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    Tutorial complete! Your progress has been saved.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
