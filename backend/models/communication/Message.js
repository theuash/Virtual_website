import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
  { timestamps: true, collection: 'messages' }
);

// Fast paginated history: find by conversation, sorted by time
messageSchema.index({ conversationId: 1, createdAt: -1 });
// Unread count queries
messageSchema.index({ conversationId: 1, isRead: 1, senderId: 1 });

export const Message = mongoose.model('Message', messageSchema);
