import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['credit', 'debit', 'escrow_hold', 'escrow_release', 'refund'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  method:      { type: String },   // 'upi', 'card', 'netbanking', 'wallet_balance'
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdAt:   { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, unique: true },
  currency:     { type: String, enum: ['INR', 'USD'], default: 'INR' },
  balance:      { type: Number, default: 0 },       // available balance in ₹
  escrowHeld:   { type: Number, default: 0 },        // locked in escrow
  totalAdded:   { type: Number, default: 0 },
  totalSpent:   { type: Number, default: 0 },
  transactions: [transactionSchema],
}, { timestamps: true, collection: 'wallets' });

export const Wallet = mongoose.model('Wallet', walletSchema);
