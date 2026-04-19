import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/LearningVideo.js';
import { learningVideos } from './data/learningVideos.js';

await connectDB();

// Wipe the entire collection
await LearningVideo.deleteMany({});
console.log('✓ Cleared all learning_videos documents');

// Insert fresh
for (const doc of learningVideos) {
  await LearningVideo.create(doc);
  console.log(`✓ Created: ${doc.skill} - ${doc.software}`);
}

// Verify
const all = await LearningVideo.find().lean();
console.log(`\n✅ Total documents: ${all.length}`);
for (const d of all) {
  console.log(`  ${d.skill}/${d.software}: tutorials=${d.tutorials.length} playlists=${d.playlists.length} crash_courses=${d.crash_courses.length}`);
}

process.exit(0);
