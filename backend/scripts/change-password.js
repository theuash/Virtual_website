import 'dotenv/config.js';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';

await connectDB();

const email = 'maazmohammed072006@gmail.com';
const newPassword = 'maaza@123';

const hash = await bcrypt.hash(newPassword, 10);
const result = await MomentumSupervisor.findOneAndUpdate(
  { email },
  { passwordHash: hash }
);

console.log(result ? `✅ Password updated for ${result.email}` : '❌ User not found');
process.exit(0);
