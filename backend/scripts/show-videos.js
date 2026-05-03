import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/learning/LearningVideo.js';

async function showVideos() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const doc = await LearningVideo.findOne({ skill: 'video_editing', software: 'davinci_resolve' });
    
    if (!doc) {
      console.log('❌ No document found!');
      process.exit(1);
    }

    console.log('📚 Document Found:\n');
    console.log(`Skill: ${doc.skill}`);
    console.log(`Software: ${doc.software}\n`);

    console.log('=== TUTORIALS ===');
    if (doc.tutorials && doc.tutorials.length > 0) {
      doc.tutorials.forEach((tutorial, idx) => {
        console.log(`\n[${idx + 1}] ${tutorial.title}`);
        console.log(`    ID: ${tutorial.id}`);
        console.log(`    Description: ${tutorial.desc}`);
        console.log(`    Instructor: ${tutorial.instructor}`);
        console.log(`    Duration: ${tutorial.duration}`);
        console.log(`    Level: ${tutorial.level}`);
        console.log(`    YouTube ID: ${tutorial.youtubeId}`);
      });
    } else {
      console.log('No tutorials found');
    }

    console.log('\n=== PLAYLISTS ===');
    if (doc.playlists && doc.playlists.length > 0) {
      doc.playlists.forEach((playlist, idx) => {
        console.log(`\n[${idx + 1}] ${playlist.title}`);
        console.log(`    ID: ${playlist.id}`);
        console.log(`    Description: ${playlist.description}`);
        console.log(`    Level: ${playlist.level}`);
        console.log(`    Videos: ${playlist.videos?.length || 0}`);
        if (playlist.videos && playlist.videos.length > 0) {
          playlist.videos.forEach((video, vidx) => {
            console.log(`      [${vidx + 1}] ${video.title}`);
            console.log(`          YouTube ID: ${video.youtubeId}`);
            console.log(`          Description: ${video.desc}`);
            console.log(`          Duration: ${video.duration}`);
            console.log(`          Level: ${video.level}`);
          });
        }
      });
    } else {
      console.log('No playlists found');
    }

    console.log('\n=== CRASH COURSES ===');
    if (doc.crash_courses && doc.crash_courses.length > 0) {
      doc.crash_courses.forEach((course, idx) => {
        console.log(`\n[${idx + 1}] ${course.title}`);
        console.log(`    ID: ${course.id}`);
        console.log(`    Description: ${course.description}`);
        console.log(`    Level: ${course.level}`);
        console.log(`    Videos: ${course.videos?.length || 0}`);
        if (course.videos && course.videos.length > 0) {
          course.videos.forEach((video, vidx) => {
            console.log(`      [${vidx + 1}] ${video.title}`);
            console.log(`          YouTube ID: ${video.youtubeId}`);
            console.log(`          Description: ${video.desc}`);
            console.log(`          Duration: ${video.duration}`);
            console.log(`          Level: ${video.level}`);
          });
        }
      });
    } else {
      console.log('No crash courses found');
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showVideos();
