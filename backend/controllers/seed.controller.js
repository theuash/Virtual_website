import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';
import { Project } from '../models/Project.js';
import { MicroTask } from '../models/MicroTask.js';
import { Pricing } from '../models/Pricing.js';
import { pricingData } from '../data/pricingData.js';
import bcrypt from 'bcryptjs';

export const runSeed = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json(new ApiResponse(403, null, 'Cannot seed in production'));
  }

  // ── Seed pricing (safe upsert) ────────────────────────────────
  for (const dept of pricingData) {
    await Pricing.findOneAndUpdate(
      { department: dept.department },
      dept,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // ── Create Momentum Supervisor: Mohammad Maaz ─────────────────
  const existing = await MomentumSupervisor.findOne({ email: 'maazmohammed072006@gmail.com' });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('maaza@123', salt);

    await MomentumSupervisor.create({
      email:       'maazmohammed072006@gmail.com',
      passwordHash,
      role:        'momentum_supervisor',
      fullName:    'Mohammad Maaz',
      phone:       '+917483316929',
      phoneVerified: true,
      isVerified:  true,
      authMethod:  'password',
      dateOfBirth: new Date('2006-05-07'),
    });
  }

  res.json(new ApiResponse(200, null, 'Pricing seeded. Maaz account ready.'));
});

export const clearSeed = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json(new ApiResponse(403, null, 'Cannot clear in production'));
  }
  // Only clear projects and tasks — never delete user accounts or pricing
  await Project.deleteMany({});
  await MicroTask.deleteMany({});
  res.json(new ApiResponse(200, null, 'Projects and tasks cleared. Users and pricing preserved.'));
});
