import 'dotenv/config.js';
import { connectDB } from './config/db.js';
import { LearningVideo } from './models/LearningVideo.js';

await connectDB();
const doc = await LearningVideo.findOne({ skill: 'video_editing', software: 'davinci_resolve' }).lean();
console.log('--- RAW DOCUMENT ---');
console.log('tutorials:', doc?.tutorials?.length, JSON.stringify(doc?.tutorials?.[0], null, 2));
console.log('playlists:', doc?.playlists?.length, JSON.stringify(doc?.playlists?.[0], null, 2));
console.log('crash_courses:', doc?.crash_courses?.length, JSON.stringify(doc?.crash_courses?.[0], null, 2));

// Simulate what the route does
const catalogue = {};
const docs = await LearningVideo.find();
for (const d of docs) {
  if (!catalogue[d.skill]) catalogue[d.skill] = {};
  catalogue[d.skill][d.software] = {
    tutorials: d.tutorials,
    playlists: d.playlists,
    crash_courses: d.crash_courses,
  };
}
const content = catalogue['video_editing']?.['davinci_resolve'];
console.log('\n--- CATALOGUE SIMULATION ---');
console.log('tutorials count:', content?.tutorials?.length);
console.log('playlists count:', content?.playlists?.length);
console.log('crash_courses count:', content?.crash_courses?.length);
process.exit(0);
