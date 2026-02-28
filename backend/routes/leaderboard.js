// ──────────────────────────────────────────────────────────────
// Leaderboard route – ranks teams by total points
// GET /api/leaderboard
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const Team = require('../models/Team');

router.get('/', async (_req, res, next) => {
  try {
    // Build a task points map
    const allTasks = await Task.find().select('_id points').lean();
    const taskPointsMap = {};
    allTasks.forEach((t) => { taskPointsMap[t._id.toString()] = t.points || 0; });

    // Aggregate: for each team sum completed tasks, total elapsed time, and photo points
    const stats = await Submission.aggregate([
      { $match: { status: { $in: ['completed', 'blocked'] } } },
      {
        $group: {
          _id: '$team',
          totalElapsedMs: { $sum: '$elapsedMs' },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalPhotoPoints: {
            $sum: { $ifNull: ['$photoPoints', 0] },
          },
          // Collect task IDs for completed submissions to calculate task base points
          completedTaskIds: {
            $push: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$task', '$$REMOVE'],
            },
          },
        },
      },
    ]);

    // Calculate total points: task base points (for completed) + photo points
    const enriched = stats.map((s) => {
      const taskBasePoints = (s.completedTaskIds || []).reduce((sum, taskId) => {
        return sum + (taskPointsMap[taskId.toString()] || 0);
      }, 0);
      return {
        ...s,
        totalPoints: taskBasePoints + (s.totalPhotoPoints || 0),
      };
    });

    // Sort by total points (desc), then by fewer elapsed time
    enriched.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return (a.totalElapsedMs || 0) - (b.totalElapsedMs || 0);
    });

    // Hydrate team names (exclude admin accounts)
    const teamIds = enriched.map((s) => s._id);
    const teams = await Team.find({ _id: { $in: teamIds } }).lean();
    const teamMap = {};
    const adminTeamIds = new Set();
    teams.forEach((t) => {
      teamMap[t._id.toString()] = t;
      if (t.role === 'admin') adminTeamIds.add(t._id.toString());
    });

    const leaderboard = enriched
      .filter((s) => !adminTeamIds.has(s._id.toString()))
      .map((s, i) => ({
        rank: i + 1,
        teamId: s._id,
        teamName: teamMap[s._id.toString()]?.name || 'Unknown',
        avatarColor: teamMap[s._id.toString()]?.avatarColor || '#00f0ff',
        completedTasks: s.completedTasks,
        totalPoints: s.totalPoints,
        totalElapsedMs: s.totalElapsedMs,
      }));

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
