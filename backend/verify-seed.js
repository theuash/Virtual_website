import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/LearningVideo.js';

async function verifySeed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const videos = await LearningVideo.find();
    console.log(`Total documents in learning_videos collection: ${videos.length}\n`);

    for (const doc of videos) {
      console.log(`📚 ${doc.skill} - ${doc.software}`);
      console.log(`   Tutorials: ${doc.tutorials?.length || 0}`);
      console.log(`   Playlists: ${doc.playlists?.length || 0}`);
      if (doc.playlists?.length > 0) {
        doc.playlists.forEach(p => {
          console.log(`     - ${p.title} (${p.videos?.length || 0} videos)`);
        });
      }
      console.log(`   Crash Courses: ${doc.crash_courses?.length || 0}`);
      if (doc.crash_courses?.length > 0) {
        doc.crash_courses.forEach(c => {
          console.log(`     - ${c.title} (${c.videos?.length || 0} videos)`);
        });
      }
      console.log();
    }

    console.log('✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifySeed();
