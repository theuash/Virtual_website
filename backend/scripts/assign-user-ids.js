import 'dotenv/config.js';
import { connectDB } from '../config/db.js';
import { Freelancer } from '../models/users/Freelancer.js';
import { Client } from '../models/users/Client.js';
import { MomentumSupervisor } from '../models/users/MomentumSupervisor.js';
import { User } from '../models/users/User.js';
import { generateUserId } from '../utils/userId.js';

await connectDB();

const models = [
  { name: 'Freelancer',          Model: Freelancer },
  { name: 'Client',              Model: Client },
  { name: 'MomentumSupervisor',  Model: MomentumSupervisor },
  { name: 'Admin',               Model: User },
];

for (const { name, Model } of models) {
  const docs = await Model.find({ userId: { $exists: false } }).lean();
  console.log(`${name}: ${docs.length} without userId`);

  for (const doc of docs) {
    const userId = await generateUserId('IN', doc.createdAt || new Date());
    await Model.findByIdAndUpdate(doc._id, { userId });
    console.log(`  ✅ ${doc.email} → ${userId}`);
  }
}

console.log('\nDone.');
process.exit(0);
