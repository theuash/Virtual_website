import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  usedAt: {
    type: Date,
  },
  applicableServices: [{
    type: String, // department names or service IDs
  }],
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return !this.isUsed && this.expiryDate > now;
};

export const Coupon = mongoose.model('Coupon', couponSchema);
