import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { MomentumSupervisor } from './models/users/MomentumSupervisor.js';
import { generateSupervisorCode } from './utils/supervisorCode.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

await connectDB();

await mongoose.connection.collection('momentum_supervisors').deleteMany({ _id: {} });

const email = 'lumetic19@gmail.com';
const existing = await MomentumSupervisor.findOne({ email });

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash('lumetic@123', salt);

if (existing) {
  existing.passwordHash = passwordHash;
  existing.isVerified = true;
  existing.fullName = existing.fullName || 'Lumetic';
  if (!existing.supervisorCode) {
    existing.supervisorCode = await generateSupervisorCode(email, 'IN', existing.createdAt || new Date());
  }
  await existing.save();
  console.log('Updated:', existing.fullName, '| Code:', existing.supervisorCode, '| ID:', existing._id.toString());
} else {
  const code = await generateSupervisorCode(email, 'IN');
  const sup = await MomentumSupervisor.create({
    email,
    passwordHash,
    fullName: 'Lumetic',
    role: 'momentum_supervisor',
    authMethod: 'password',
    isVerified: true,
    phoneVerified: false,
    supervisorCode: code,
  });
  console.log('Created:', sup.fullName, '| Code:', sup.supervisorCode, '| ID:', sup._id.toString());
}

process.exit(0);
