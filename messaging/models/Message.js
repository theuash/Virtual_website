import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,          // adds createdAt + updatedAt
    collection: 'messages',
  }
);

// Compound index for fast paginated history queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for unread count queries
messageSchema.index({ conversationId: 1, isRead: 1, senderId: 1 });

export const Message = mongoose.model('Message', messageSchema);
