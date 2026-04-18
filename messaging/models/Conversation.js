import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    // 'dm' = direct message between two users
    // 'team' = group chat for a department/team
    // 'project' = chat tied to a specific project
    type: {
      type: String,
      enum: ['dm', 'team', 'project'],
      required: true,
      default: 'dm',
    },

    // Array of user ObjectIds (from any collection — clients, freelancers, supervisors)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],

    // Only set for type === 'project'
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },

    // Optional display name (for team/project conversations)
    name: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Fast lookup: all conversations a user is in
conversationSchema.index({ members: 1, updatedAt: -1 });

// Prevent duplicate DM conversations between the same two users
// (enforced in application logic, not a unique index, because array order varies)

export const Conversation = mongoose.model('Conversation', conversationSchema);
