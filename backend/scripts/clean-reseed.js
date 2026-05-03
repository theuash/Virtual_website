import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/learning/LearningVideo.js';
import { learningVideos } from './data/learningVideos.js';

await connectDB();

// Drop the collection entirely to remove old indexes
await LearningVideo.collection.drop().catch(() => {
  console.log('ℹ Collection did not exist, creating fresh');
});
console.log('✓ Dropped collection and all indexes');

// Wipe the entire collection (safety measure)
await LearningVideo.deleteMany({});
console.log('✓ Cleared all learning_videos documents');

// Insert fresh
for (const doc of learningVideos) {
  try {
    await LearningVideo.create(doc);
    console.log(`✓ Created: ${doc.skill} - ${doc.software}`);
  } catch (error) {
    console.error(`❌ Failed to create ${doc.skill} - ${doc.software}:`, error.message);
  }
}

// Verify
const all = await LearningVideo.find().lean();
console.log(`\n✅ Total documents: ${all.length}`);
for (const d of all) {
  console.log(`  ${d.skill}/${d.software}: tutorials=${d.tutorials.length} playlists=${d.playlists.length} crash_courses=${d.crash_courses.length}`);
}

process.exit(0);
