import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';

// ── Get meetings for freelancer ───────────────────────────────────
export const getFreelancerMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    $or: [
      { initiatorId: req.user._id, initiatorRole: 'freelancer' },
      { participants: req.user._id }
    ]
  })
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar')
    .sort({ scheduledTime: -1 });

  res.json(new ApiResponse(200, meetings, 'Freelancer meetings retrieved'));
});

// ── Get meetings for client ───────────────────────────────────────
export const getClientMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    $or: [
      { initiatorId: req.user._id, initiatorRole: 'client' },
      { participants: req.user._id }
    ]
  })
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar')
    .sort({ scheduledTime: -1 });

  res.json(new ApiResponse(200, meetings, 'Client meetings retrieved'));
});

// ── Create meeting for freelancer ─────────────────────────────────
export const createFreelancerMeeting = asyncHandler(async (req, res) => {
  const { title, description, scheduledTime, duration, participants, projectId } = req.body;

  if (!title || !scheduledTime || !duration) {
    return res.status(400).json(new ApiResponse(400, null, 'Missing required fields'));
  }

  // Generate unique meeting link
  const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meet/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const meeting = await Meeting.create({
    title,
    description,
    initiatorId: req.user._id,
    initiatorRole: 'freelancer',
    scheduledTime: new Date(scheduledTime),
    duration,
    participants: participants || [req.user._id],
    meetingLink,
    projectId,
  });

  const populatedMeeting = await meeting.populate('initiatorId', 'fullName avatar');

  res.status(201).json(new ApiResponse(201, populatedMeeting, 'Meeting scheduled'));
});

// ── Create meeting for client ─────────────────────────────────────
export const createClientMeeting = asyncHandler(async (req, res) => {
  const { title, description, scheduledTime, duration, participants, projectId } = req.body;

  if (!title || !scheduledTime || !duration) {
    return res.status(400).json(new ApiResponse(400, null, 'Missing required fields'));
  }

  // Generate unique meeting link
  const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meet/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const meeting = await Meeting.create({
    title,
    description,
    initiatorId: req.user._id,
    initiatorRole: 'client',
    scheduledTime: new Date(scheduledTime),
    duration,
    participants: participants || [req.user._id],
    meetingLink,
    projectId,
  });

  const populatedMeeting = await meeting.populate('initiatorId', 'fullName avatar');

  res.status(201).json(new ApiResponse(201, populatedMeeting, 'Meeting scheduled'));
});

// ── Get meeting detail ────────────────────────────────────────────
export const getMeetingDetail = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('initiatorId', 'fullName avatar email')
    .populate('participants', 'fullName avatar email');

  if (!meeting) {
    return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  }

  // Check if user is participant or initiator
  const isParticipant = meeting.participants.some(p => p._id.toString() === req.user._id.toString());
  const isInitiator = meeting.initiatorId._id.toString() === req.user._id.toString();

  if (!isParticipant && !isInitiator) {
    return res.status(403).json(new ApiResponse(403, null, 'Unauthorized'));
  }

  res.json(new ApiResponse(200, meeting, 'Meeting details retrieved'));
});

// ── Update meeting status ─────────────────────────────────────────
export const updateMeetingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid status'));
  }

  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar');

  if (!meeting) {
    return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  }

  res.json(new ApiResponse(200, meeting, 'Meeting status updated'));
});

// ── Add participant to meeting ────────────────────────────────────
export const addParticipant = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    return res.status(400).json(new ApiResponse(400, null, 'Participant ID required'));
  }

  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { participants: participantId } },
    { new: true }
  )
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar');

  if (!meeting) {
    return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  }

  res.json(new ApiResponse(200, meeting, 'Participant added'));
});

// ── Cancel meeting ────────────────────────────────────────────────
export const cancelMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  )
    .populate('initiatorId', 'fullName avatar')
    .populate('participants', 'fullName avatar');

  if (!meeting) {
    return res.status(404).json(new ApiResponse(404, null, 'Meeting not found'));
  }

  res.json(new ApiResponse(200, meeting, 'Meeting cancelled'));
});
