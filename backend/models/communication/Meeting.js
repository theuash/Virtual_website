import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  // ── Core ──────────────────────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  
  // ── Participants ──────────────────────────────────────────────
  initiatorId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  initiatorRole: { type: String, enum: ['client', 'freelancer', 'momentum_supervisor', 'project_initiator'], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ── Scheduling ───────────────────────────────────────────────
  scheduledTime: { type: Date, required: true },
  duration:      { type: Number, required: true },  // in minutes
  
  // ── Status ────────────────────────────────────────────────────
  status:        { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  
  // ── Meeting Link ──────────────────────────────────────────────
  meetingLink:   { type: String },  // generated meeting URL
  
  // ── Recording ─────────────────────────────────────────────────
  recordingUrl:  { type: String },
  isRecorded:    { type: Boolean, default: false },
  
  // ── Related Project ───────────────────────────────────────────
  projectId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  
}, { timestamps: true });

export const Meeting = mongoose.model('Meeting', meetingSchema);
