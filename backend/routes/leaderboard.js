// ──────────────────────────────────────────────────────────────
// Leaderboard route – ranks teams by total elapsed time
// GET /api/leaderboard
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const Submission = require('../models/Submission');
const Team = require('../models/Team');

router.get('/', async (_req, res, next) => {
  try {
    // Aggregate: for each team sum completed tasks and total elapsed time
    const stats = await Submission.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$team',
          totalElapsedMs: { $sum: '$elapsedMs' },
          completedTasks: { $sum: 1 },
        },
      },
      { $sort: { completedTasks: -1, totalElapsedMs: 1 } }, // more tasks first, then fastest
    ]);

    // Hydrate team names
    const teamIds = stats.map((s) => s._id);
    const teams = await Team.find({ _id: { $in: teamIds } }).lean();
    const teamMap = {};
    teams.forEach((t) => {
      teamMap[t._id.toString()] = t;
    });

    const leaderboard = stats.map((s, i) => ({
      rank: i + 1,
      teamId: s._id,
      teamName: teamMap[s._id.toString()]?.name || 'Unknown',
      avatarColor: teamMap[s._id.toString()]?.avatarColor || '#00f0ff',
      completedTasks: s.completedTasks,
      totalElapsedMs: s.totalElapsedMs,
    }));

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
