import mongoose from 'mongoose';

const txSchema = new mongoose.Schema({
  type:        { type: String, enum: ['earning', 'withdrawal', 'bonus'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, default: '' },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  reference:   { type: String },
  createdAt:   { type: Date, default: Date.now },
});

const supervisorWalletSchema = new mongoose.Schema({
  supervisorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'MomentumSupervisor', required: true, unique: true },
  balance:        { type: Number, default: 0 },
  totalEarned:    { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  transactions:   [txSchema],
}, { timestamps: true, collection: 'supervisor_wallets' });

export const SupervisorWallet = mongoose.model('SupervisorWallet', supervisorWalletSchema);
