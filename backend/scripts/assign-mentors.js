import 'dotenv/config.js';
import { connectDB } from '../config/db.js';
import { Freelancer } from '../models/Freelancer.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';

await connectDB();

// Find all freelancers without a mentor
const unassigned = await Freelancer.find({ mentorId: { $exists: false } }).lean();
console.log(`Found ${unassigned.length} freelancer(s) without a mentor.`);

if (unassigned.length === 0) { process.exit(0); }

// Get all supervisors
const supervisors = await MomentumSupervisor.find({ isSuspended: { $ne: true } }).select('_id').lean();
if (supervisors.length === 0) {
  console.log('No supervisors found. Skipping.');
  process.exit(0);
}

for (const freelancer of unassigned) {
  // Find supervisor with fewest precrate freelancers
  const counts = await Promise.all(
    supervisors.map(async (s) => ({
      id: s._id,
      count: await Freelancer.countDocuments({ mentorId: s._id, tier: 'precrate' }),
    }))
  );
  counts.sort((a, b) => a.count - b.count);
  const mentorId = counts[0].id;

  await Freelancer.findByIdAndUpdate(freelancer._id, { mentorId });
  await MomentumSupervisor.findByIdAndUpdate(mentorId, {
    $addToSet: { supervisedFreelancers: freelancer._id },
  });
  console.log(`✅ ${freelancer.email} → mentor ${mentorId}`);
}

console.log('Done.');
process.exit(0);
