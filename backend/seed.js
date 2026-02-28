// ──────────────────────────────────────────────────────────────
// Seed script – populates the database with sample tasks
// Run:  npm run seed   (or:  node seed.js)
// ──────────────────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

const TASKS = [
  {
    title: 'The Welcome Arch',
    description:
      'Find the grand entrance where every attendee begins their journey. Look for the structure that frames the first impression of the conference.',
    locationHint: 'Near the main entrance / registration area',
    detailedHint: "It's right behind the badge pick-up desks — look up!",
    points: 100,
    order: 1,
  },
  {
    title: 'The Innovation Wall',
    description:
      'Somewhere in the venue, sponsors have left their mark on a massive display. Find the wall covered in logos and futuristic graphics.',
    locationHint: 'Main hall / exhibition area',
    detailedHint: 'Check the corridor between Hall A and Hall B.',
    points: 100,
    order: 2,
  },
  {
    title: 'The Hidden Garden',
    description:
      'Not everything at this conference is indoors. Find the outdoor space where attendees go to recharge — nature meets networking.',
    locationHint: 'Outdoor / terrace area',
    detailedHint: 'Follow the signs to the "Chill Zone" on level 0.',
    points: 150,
    order: 3,
  },
  {
    title: "The Speaker's Podium",
    description:
      'Every great idea starts on a stage. Find the main keynote stage and snap a photo of the podium before the next talk begins.',
    locationHint: 'Main auditorium',
    detailedHint: "It's the largest room in the venue — follow the crowd!",
    points: 100,
    order: 4,
  },
  {
    title: 'The Coffee Oracle',
    description:
      "Legend says there's a barista here who knows the future of tech. Find the best coffee spot in the venue and capture the moment.",
    locationHint: 'Food & beverage area',
    detailedHint: 'Level 1, next to the workshop rooms. Look for the longest queue.',
    points: 100,
    order: 5,
  },
  {
    title: 'The Secret QR Code',
    description:
      "Hidden in plain sight — a QR code has been placed somewhere unusual. Find it, scan it, and take a selfie with it.",
    locationHint: 'Could be anywhere!',
    detailedHint: 'Check the bathroom mirrors... yes, really.',
    points: 200,
    order: 6,
  },
  {
    title: 'Team Spirit',
    description:
      'Gather ALL your team members, find the conference mascot (or mascot poster), and take a group photo together.',
    locationHint: 'Registration / info desk area',
    detailedHint: 'The mascot standee is next to the info booth near entrance B.',
    points: 150,
    order: 7,
  },
  {
    title: 'The Vintage Corner',
    description:
      'Somewhere in this modern venue, a piece of computing history is on display. Find the retro tech exhibit and photograph it.',
    locationHint: 'Exhibition / sponsor booths',
    detailedHint: 'Booth #42 — "The Museum of Code" pop-up.',
    points: 150,
    order: 8,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scavenger-hunt');
    console.log('✅  Connected to MongoDB');

    await Task.deleteMany({});
    console.log('🗑️   Cleared existing tasks');

    await Task.insertMany(TASKS);
    console.log(`🌱  Seeded ${TASKS.length} tasks`);

    await mongoose.disconnect();
    console.log('✅  Done');
  } catch (err) {
    console.error('❌  Seed error:', err);
    process.exit(1);
  }
}

seed();
