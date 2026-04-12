import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import { Project } from '../models/Project.js';
import { MicroTask } from '../models/MicroTask.js';
import bcrypt from 'bcryptjs';

export const runSeed = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json(new ApiResponse(403, null, 'Cannot seed in production'));
  }

  // Clear existing
  await User.deleteMany({});
  await Project.deleteMany({});
  await MicroTask.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@1234', salt);
  const userPasswordHash = await bcrypt.hash('demo123', salt);

  // 1. Admin
  await User.create({
    email: 'admin@virtual.io',
    passwordHash,
    role: 'admin',
    fullName: 'System Administrator',
    isVerified: true
  });

  // 2. Clients
  const client1 = await Client.create({
    email: 'client@demo.com',
    passwordHash: userPasswordHash,
    role: 'client',
    fullName: 'Alex Morgan',
    companyName: 'TechStartup Inc.',
    totalSpent: 12400,
  });

  // 3. Freelancers
  const free1 = await Freelancer.create({
    email: 'freelancer@demo.com',
    passwordHash: userPasswordHash,
    role: 'freelancer',
    fullName: 'Arjun Sharma',
    primarySkill: 'video_editing',
    tier: 'crate',
    totalEarnings: 4800,
    tasksCompleted: 12,
  });

  // 4. Create Project
  const project1 = await Project.create({
    title: "Brand Promo Video",
    description: "Create a 60s brand promo using raw footage.",
    category: "video_editing",
    clientId: client1._id,
    budget: 800,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'in_progress',
  });

  // 5. Create MicroTask
  await MicroTask.create({
    projectId: project1._id,
    title: "Edit Raw Footage - Part 1",
    description: "Color grade and trim the first 30 seconds.",
    assignedTo: free1._id,
    skillRequired: "video_editing",
    status: "assigned",
    earnings: 200,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  });

  res.json(new ApiResponse(200, null, 'Database seeded successfully'));
});

export const clearSeed = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json(new ApiResponse(403, null, 'Cannot clear in production'));
  }
  await User.deleteMany({});
  await Project.deleteMany({});
  await MicroTask.deleteMany({});
  res.json(new ApiResponse(200, null, 'Database cleared'));
});
