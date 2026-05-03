import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import api from '../../../services/api';
import {
  Video, Phone, Copy, Share2, Clock, User, Calendar, Plus, X,
  CheckCircle2, AlertCircle, Loader2, MessageSquare
} from 'lucide-react';

export default function ClientMeet() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 30,
    participants: [],
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/client/meetings');
      setMeetings(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/client/meetings', formData);
      setMeetings([...meetings, res.data?.data]);
      setShowSchedule(false);
      setFormData({ title: '', description: '', scheduledTime: '', duration: 30, participants: [] });
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
    }
  };

  const copyMeetingLink = (meetingId) => {
    const link = `${window.location.origin}/meet/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startMeeting = (meeting) => {
    navigate(`/meet/${meeting._id}`);
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Meet" />
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Meet - Video Meetings" />

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Video Meetings
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Schedule and conduct video meetings with freelancers
            </p>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Plus size={16} /> Schedule Meeting
          </button>
        </div>

        {/* Schedule Meeting Modal */}
        {showSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowSchedule(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Schedule Meeting
                </h2>
                <button
                  onClick={() => setShowSchedule(false)}
                  className="p-1 rounded-lg hover:bg-opacity-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Project Review"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What will you discuss?"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                      Duration (min)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSchedule(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Meetings Grid */}
        {meetings.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(110,44,242,0.1)' }}
            >
              <Video size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No meetings scheduled
            </h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Schedule your first meeting with a freelancer to get started with video conferencing.
            </p>
            <button
              onClick={() => setShowSchedule(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus size={16} /> Schedule Meeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => {
              const meetingTime = new Date(meeting.scheduledTime);
              const now = new Date();
              const isUpcoming = meetingTime > now;
              const isLive = now >= meetingTime && now < new Date(meetingTime.getTime() + meeting.duration * 60000);

              return (
                <motion.div
                  key={meeting._id}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isLive && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#ef4444', color: '#fff' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {isUpcoming && !isLive && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(110,44,242,0.1)', color: 'var(--accent)' }}>
                            UPCOMING
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {meeting.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {meeting.description && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {meeting.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {meetingTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' at '}
                      {meetingTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Clock size={14} />
                      {meeting.duration} minutes
                    </div>

                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <User size={14} />
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="p-3 border-t flex gap-2"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                  >
                    {isLive ? (
                      <button
                        onClick={() => startMeeting(meeting)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: '#ef4444', color: '#fff' }}
                      >
                        <Video size={14} /> Join Now
                      </button>
                    ) : isUpcoming ? (
                      <>
                        <button
                          onClick={() => copyMeetingLink(meeting._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        >
                          {copiedId === meeting._id ? (
                            <>
                              <CheckCircle2 size={14} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy Link
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => startMeeting(meeting)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          <Video size={14} /> Start
                        </button>
                      </>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      >
                        <CheckCircle2 size={14} /> Completed
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
