import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Share2, Settings, LogOut } from 'lucide-react';

export default function MeetRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', avatar: '👤', isMuted: false, isVideoOff: false }
  ]);

  const handleEndCall = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Video Meeting
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Meeting ID: {meetingId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            🔴 LIVE
          </span>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl" style={{ background: 'var(--bg-card)' }}>
              📹
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Video Meeting Room
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This is a placeholder for the video meeting interface.
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
              In production, integrate with Jitsi Meet, Agora, or similar service.
            </p>
          </div>
        </div>
      </div>

      {/* Participants sidebar */}
      <div
        className="w-full md:w-64 border-t md:border-t-0 md:border-l p-4 max-h-48 md:max-h-full overflow-y-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Participants ({participants.length})
        </h3>
        <div className="space-y-2">
          {participants.map(p => (
            <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--accent)', color: '#fff' }}>
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {p.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className="p-4 border-t flex items-center justify-center gap-3 flex-wrap"
        style={{ borderColor: 'var(--border)' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMicOn(!isMicOn)}
          className="p-3 rounded-full transition-all"
          style={{
            background: isMicOn ? 'var(--accent)' : '#ef4444',
            color: '#fff'
          }}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="p-3 rounded-full transition-all"
          style={{
            background: isVideoOn ? 'var(--accent)' : '#ef4444',
            color: '#fff'
          }}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full transition-all border"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <Share2 size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full transition-all border"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <Settings size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndCall}
          className="p-3 rounded-full transition-all"
          style={{
            background: '#ef4444',
            color: '#fff'
          }}
        >
          <PhoneOff size={20} />
        </motion.button>
      </div>
    </div>
  );
}
