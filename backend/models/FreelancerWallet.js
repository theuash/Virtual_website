import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['earning', 'withdrawal', 'bonus', 'deduction'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, default: '' },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  reference:   { type: String },   // bank ref / UPI ref
  createdAt:   { type: Date, default: Date.now },
});

const freelancerWalletSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true, unique: true },
  balance:      { type: Number, default: 0 },       // available to withdraw
  totalEarned:  { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  transactions: [transactionSchema],
}, { timestamps: true, collection: 'freelancer_wallets' });

export const FreelancerWallet = mongoose.model('FreelancerWallet', freelancerWalletSchema);
