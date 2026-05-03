import mongoose from 'mongoose';

// Per-person payout entry within a project payroll
const payoutEntrySchema = new mongoose.Schema({
  recipientId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientRole: { type: String, enum: ['project_initiator', 'crate'], required: true },
  amount:        { type: Number, required: true },
  status:        { type: String, enum: ['pending', 'paid', 'held'], default: 'pending' },
  paidAt:        { type: Date },
});

const payrollSchema = new mongoose.Schema({
  projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'MomentumSupervisor', required: true },
  totalBudget:  { type: Number, required: true },
  currency:     { type: String, enum: ['INR', 'USD'], default: 'INR' },
  entries:      [payoutEntrySchema],
  finalized:    { type: Boolean, default: false },
  finalizedAt:  { type: Date },
  meetingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }, // pre-dispatch meeting
}, { timestamps: true, collection: 'payrolls' });

export const Payroll = mongoose.model('Payroll', payrollSchema);
