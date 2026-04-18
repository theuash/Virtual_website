import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    // dm = direct message, project = tied to a project
    type: {
      type: String,
      enum: ['dm', 'project'],
      required: true,
      default: 'dm',
    },
    // User ObjectIds from any collection (clients, freelancers, supervisors)
    members: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    // Only set for type === 'project'
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    // Optional display name
    name: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'conversations' }
);

// Fast lookup: all conversations a user is in, newest first
conversationSchema.index({ members: 1, updatedAt: -1 });
conversationSchema.index({ projectId: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
