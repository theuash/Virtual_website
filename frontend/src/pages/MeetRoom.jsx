import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, PhoneOff, Copy, Check } from 'lucide-react';
import api from '../services/api';

const JITSI_DOMAIN = 'meet.jit.si';

export default function MeetRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const statusUpdatedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  const isSupervisor = user?.role === 'momentum_supervisor';

  // Update meeting status in DB
  const updateStatus = async (status) => {
    if (!isSupervisor) return; // only supervisor controls status
    try {
      await api.patch(`/supervisor/meetings/${meetingId}/status`, { status });
    } catch {
      // try freelancer route as fallback
      try { await api.patch(`/freelancer/meetings/${meetingId}/status`, { status }); } catch { /* silent */ }
    }
  };

  useEffect(() => {
    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) { initJitsi(); return; }
      const script = document.createElement('script');
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = initJitsi;
      script.onerror = () => setError('Failed to load meeting. Check your internet connection.');
      document.head.appendChild(script);
    };

    const initJitsi = () => {
      if (!jitsiContainerRef.current || apiRef.current) return;

      const roomName = `virtual-${meetingId}`.replace(/[^a-zA-Z0-9-]/g, '-');

      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName: user?.fullName || 'Guest',
          email: user?.email || '',
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          defaultLanguage: 'en',
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'recording', 'livestreaming', 'sharedvideo', 'settings',
            'raisehand', 'videoquality', 'filmstrip', 'participants-pane',
            'tileview', 'select-background', 'mute-everyone', 'security',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_FOOTER: false,
          APP_NAME: 'Virtual Meet',
          NATIVE_APP_NAME: 'Virtual Meet',
          PROVIDER_NAME: 'Virtual',
        },
      });

      // Supervisor joined → set live
      apiRef.current.addEventListener('videoConferenceJoined', () => {
        if (isSupervisor && !statusUpdatedRef.current) {
          statusUpdatedRef.current = true;
          updateStatus('live');
        }
      });

      // Supervisor left → set completed
      apiRef.current.addEventListener('videoConferenceLeft', () => {
        if (isSupervisor) updateStatus('completed');
        navigate(-1);
      });

      apiRef.current.addEventListener('readyToClose', () => {
        if (isSupervisor) updateStatus('completed');
        navigate(-1);
      });
    };

    loadJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [meetingId, user, navigate, isSupervisor]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (apiRef.current) apiRef.current.executeCommand('hangup');
    else { if (isSupervisor) updateStatus('completed'); navigate(-1); }
  };

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{error}</p>
        <button onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: '#000' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-sm tracking-tight">Virtual Meet</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            {meetingId?.slice(0, 16)}…
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
            style={{ background: '#ef4444', color: '#fff' }}>
            <PhoneOff size={12} /> Leave
          </button>
        </div>
      </div>

      {/* Jitsi container */}
      <div ref={jitsiContainerRef} className="flex-1 w-full" style={{ minHeight: 0 }}>
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
