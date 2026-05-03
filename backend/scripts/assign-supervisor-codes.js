import 'dotenv/config.js';
import { connectDB } from '../config/db.js';
import { MomentumSupervisor } from '../models/users/MomentumSupervisor.js';
import { generateSupervisorCode } from '../utils/supervisorCode.js';

await connectDB();

const supervisors = await MomentumSupervisor.find({ supervisorCode: { $exists: false } });
console.log(`Found ${supervisors.length} supervisor(s) without a code.`);

for (const sup of supervisors) {
  const code = await generateSupervisorCode(sup.email, 'IN', sup.createdAt || new Date());
  sup.supervisorCode = code;
  await sup.save();
  console.log(`✅ ${sup.email} → ${code}`);
}

console.log('Done.');
process.exit(0);
