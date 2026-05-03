import 'dotenv/config.js';
import mongoose from 'mongoose';

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Connection String:', process.env.MONGODB_URI.split('@')[1]);
    console.log('\n📋 Collections in database:\n');
    
    collections.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.name}`);
    });

    // Check learning_videos collection specifically
    console.log('\n\n=== LEARNING_VIDEOS COLLECTION ===');
    const learningCollection = db.collection('learning_videos');
    const count = await learningCollection.countDocuments();
    console.log(`Documents: ${count}`);
    
    if (count > 0) {
      const docs = await learningCollection.find({}).toArray();
      docs.forEach((doc, idx) => {
        console.log(`\n[${idx + 1}] ${doc.skill} - ${doc.software}`);
        console.log(`    Tutorials: ${doc.tutorials?.length || 0}`);
        console.log(`    Playlists: ${doc.playlists?.length || 0}`);
        console.log(`    Crash Courses: ${doc.crash_courses?.length || 0}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB();
