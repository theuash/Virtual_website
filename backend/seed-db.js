import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/LearningVideo.js';
import { learningVideos } from './data/learningVideos.js';

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Seed learning videos
    for (const videoDoc of learningVideos) {
      const result = await LearningVideo.findOneAndUpdate(
        { skill: videoDoc.skill, software: videoDoc.software },
        videoDoc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Seeded: ${videoDoc.skill} - ${videoDoc.software}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
