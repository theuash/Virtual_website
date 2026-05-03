import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Coupon } from '../models/finance/Coupon.js';

dotenv.config();

const coupons = [
  {
    code: 'VELITE5',
    discountType: 'percentage',
    discountValue: 5,
    minPurchaseAmount: 3000,
    expiryDate: new Date('2026-12-31'),
    isUsed: false
  },
  {
    code: 'VIRTUAL10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 5000,
    expiryDate: new Date('2026-12-31'),
    isUsed: false
  },
  {
    code: 'WELCOME500',
    discountType: 'fixed',
    discountValue: 500,
    minPurchaseAmount: 2000,
    expiryDate: new Date('2026-12-31'),
    isUsed: false
  }
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const coupon of coupons) {
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        coupon,
        { upsert: true, new: true }
      );
      console.log(`Coupon ${coupon.code} seeded/updated`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding coupons:', error);
    process.exit(1);
  }
};

seedCoupons();
