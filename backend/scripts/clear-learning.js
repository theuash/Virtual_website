import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/learning/LearningVideo.js';

async function clearLearning() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const result = await LearningVideo.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} documents from learning_videos collection`);

    console.log('\n✅ Cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

clearLearning();
