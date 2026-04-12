import fs from 'fs';
import path from 'path';

const serverDir = path.join(process.cwd(), 'server');
process.chdir(serverDir);

// 7. Project Model
fs.writeFileSync('models/Project.js', `import mongoose from 'mongoose';
import { SKILLS, PROJECT_STATUS } from '../config/constants.js';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: SKILLS, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: PROJECT_STATUS, default: 'open' },
  assignedInitiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  microTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MicroTask' }],
  deliverableUrl: String,
  clientApproved: { type: Boolean, default: false },
  platformFee: { type: Number, default: 0 }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
`);

// 8. MicroTask Model
fs.writeFileSync('models/MicroTask.js', `import mongoose from 'mongoose';
import { TASK_STATUS, SKILLS } from '../config/constants.js';

const microTaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillRequired: { type: String, enum: SKILLS, required: true },
  status: { type: String, enum: TASK_STATUS, default: 'unassigned' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  earnings: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  mentorNotes: String
}, { timestamps: true });

export const MicroTask = mongoose.model('MicroTask', microTaskSchema);
`);

// 9. Submission Model
fs.writeFileSync('models/Submission.js', `import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  microTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'MicroTask', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  notes: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  feedback: String
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
`);

// 10. Payment Model
fs.writeFileSync('models/Payment.js', `import mongoose from 'mongoose';
import { PAYMENT_TYPE, PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number },
  type: { type: String, enum: PAYMENT_TYPE, required: true },
  status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
  stripePaymentIntentId: String,
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
`);

// 11. Dispute Model
fs.writeFileSync('models/Dispute.js', `import mongoose from 'mongoose';
import { DISPUTE_STATUS } from '../config/constants.js';

const disputeSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  evidence: [{
    fileUrl: String,
    description: String
  }],
  status: { type: String, enum: DISPUTE_STATUS, default: 'open' },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Dispute = mongoose.model('Dispute', disputeSchema);
`);

// 12. Message Model
fs.writeFileSync('models/Message.js', `import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
`);

// 13. Notification Model
fs.writeFileSync('models/Notification.js', `import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: String // e.g., /freelancer/tasks/123
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
`);

// 14. PromotionRequest Model
fs.writeFileSync('models/PromotionRequest.js', `import mongoose from 'mongoose';
import { TIERS } from '../config/constants.js';

const promotionRequestSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentTier: { type: String, enum: TIERS, required: true },
  requestedTier: { type: String, enum: TIERS, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: String
}, { timestamps: true });

export const PromotionRequest = mongoose.model('PromotionRequest', promotionRequestSchema);
`);

console.log('Setup all mongoose models.');
