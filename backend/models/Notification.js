import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientModel: { 
    type: String, 
    required: true, 
    enum: ['Client', 'Freelancer', 'MomentumSupervisor', 'ProjectInitiator', 'Admin'] 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'system' }, // system, project, payment, etc.
  isRead: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

// Optional: index for faster lookups
notificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
