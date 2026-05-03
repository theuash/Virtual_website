import mongoose from 'mongoose';

// A Team groups Crate-level freelancers under a Project Initiator for a project
const teamSchema = new mongoose.Schema({
  projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  initiatorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  members:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],
  name:         { type: String, default: '' },
}, { timestamps: true, collection: 'teams' });

teamSchema.index({ projectId: 1 });
teamSchema.index({ initiatorId: 1 });
teamSchema.index({ members: 1 });

export const Team = mongoose.model('Team', teamSchema);
