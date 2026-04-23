import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { MomentumSupervisor } from './models/MomentumSupervisor.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

await connectDB();

// Clean up any corrupt documents
await mongoose.connection.collection('momentum_supervisors').deleteMany({ _id: {} });

const email = 'lumetic19@gmail.com';
const existing = await MomentumSupervisor.findOne({ email });

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash('lumetic@123', salt);

if (existing) {
  existing.passwordHash = passwordHash;
  existing.isVerified = true;
  existing.fullName = existing.fullName || 'Lumetic';
  await existing.save();
  console.log('Updated:', existing.fullName, '| ID:', existing._id.toString());
} else {
  const sup = await MomentumSupervisor.create({
    email,
    passwordHash,
    fullName: 'Lumetic',
    role: 'momentum_supervisor',
    authMethod: 'password',
    isVerified: true,
    phoneVerified: false,
  });
  console.log('Created:', sup.fullName, '| ID:', sup._id.toString());
}

process.exit(0);
