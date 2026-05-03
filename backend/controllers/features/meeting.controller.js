import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Meeting } from '../../models/communication/Meeting.js';

// ── Shared helpers ────────────────────────────────────────────────
const getMeetingsForUser = (userId) =>
  Meeting.find({ $or: [{ initiatorId: userId }, { participants: userId }] })
    .populate('initiatorId', 'fullName avatar role')
    .populate('participants', 'fullName avatar role')
    .sort({ scheduledTime: -1 });

const buildMeeting = async (req, initiatorRole) => {
  const { title, description, scheduledTime, duration, participants = [], projectId } = req.body;
  if (!title || !scheduledTime || !duration)
    throw new Error('title, scheduledTime and duration are required');

  const allParticipants = [...new Set([req.user._id.toString(), ...participants])];
  const meetingToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meet/${meetingToken}`;

  const meeting = await Meeting.create({
    title, description,
    initiatorId: req.user._id,
    initiatorRole,
    scheduledTime: new Date(scheduledTime),
    duration,
    participants: allParticipants,
    meetingLink,
    ...(projectId && { projectId }),
  });
  return meeting.populate('initiatorId', 'fullName avatar');
};

// ── GET /freelancer/meetings ──────────────────────────────────────
export const getFreelancerMeetings = asyncHandler(async (req, res) => {
  const meetings = await getMeetingsForUser(req.user._id);
  res.json(new ApiResponse(200, meetings, 'Meetings retrieved'));
});

// ── GET /client/meetings ──────────────────────────────────────────
export const getClientMeetings = asyncHandler(async (req, res) => {
  const meetings = await getMeetingsForUser(req.user._id);
  res.json(new ApiResponse(200, meetings, 'Meetings retrieved'));
});

// ── POST /freelancer/meetings (project_initiator / supervisor only)
export const createFreelancerMeeting = asyncHandler(async (req, res) => {
  const canSchedule =
    req.user.tier === 'project_initiator' ||
    req.user.role === 'momentum_supervisor';
  if (!canSchedule)
    return res.status(403).json(new ApiResponse(403, null, 'Only project initiators and supervisors can schedule meetings'));

  // Use tier as initiatorRole for project_initiator, role otherwise
  const initiatorRole = req.user.role === 'momentum_supervisor'
    ? 'momentum_supervisor'
    : 'project_initiator';

  const meeting = await buildMeeting(req, initiatorRole);
  res.status(201).json(new ApiResponse(201, meeting, 'Meeting scheduled'));
});

// ── POST /client/meetings ─────────────────────────────────────────
export const createClientMeeting = asyncHandler(async (req, res) => {
  const meeting = await buildMeeting(req, 'client');
  res.status(201).json(new ApiResponse(201, meeting, 'Meeting scheduled'));
});

// ── GET /*/meetings/:id ───────────────────────────────────────────
export const getMeetingDetail = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('initiatorId', 'fullName avatar email')
    .populate('participants', 'fullName avatar email');
  if (!meeting) return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));

  const uid = req.user._id.toString();
  const isMember =
    meeting.initiatorId._id.toString() === uid ||
    meeting.participants.some(p => p._id.toString() === uid);
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Unauthorized'));

  res.json(new ApiResponse(200, meeting, 'Meeting details retrieved'));
});

// ── PATCH /*/meetings/:id/status ─────────────────────────────────
export const updateMeetingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['scheduled', 'live', 'completed', 'cancelled'].includes(status))
    return res.status(400).json(new ApiResponse(400, null, 'Invalid status'));

  const meeting = await Meeting.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar');
  if (!meeting) return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  res.json(new ApiResponse(200, meeting, 'Status updated'));
});

// ── POST /*/meetings/:id/participants ─────────────────────────────
export const addParticipant = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json(new ApiResponse(400, null, 'participantId required'));

  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { participants: participantId } },
    { new: true }
  ).populate('initiatorId', 'fullName avatar').populate('participants', 'fullName avatar');
  if (!meeting) return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  res.json(new ApiResponse(200, meeting, 'Participant added'));
});

// ── POST /*/meetings/:id/cancel ───────────────────────────────────
export const cancelMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id, { status: 'cancelled' }, { new: true }
  ).populate('initiatorId', 'fullName avatar').populate('participants', 'fullName avatar');
  if (!meeting) return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  res.json(new ApiResponse(200, meeting, 'Meeting cancelled'));
});
