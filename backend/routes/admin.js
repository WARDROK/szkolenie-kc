// ──────────────────────────────────────────────────────────────
// Admin routes – full CRUD for tasks, photo moderation, config
// All routes require auth + admin role
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const Task = require('../models/Task');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const GameConfig = require('../models/GameConfig');
const fs = require('fs');
const path = require('path');

// Apply auth + admin to all routes in this file
router.use(auth, adminOnly);

// ══════════════════════════════════════════════════════════════
// ██ GAME CONFIG
// ══════════════════════════════════════════════════════════════

// GET /api/admin/config – get current game configuration
router.get('/config', async (_req, res, next) => {
  try {
    const config = await GameConfig.getConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/config – update game configuration
// ★ EASY TO MODIFY: Change points, time bonuses, map center, etc.
router.put('/config', async (req, res, next) => {
  try {
    const config = await GameConfig.getConfig();
    const allowedFields = [
      'defaultTaskPoints',
      'timeBonusThresholdSec',
      'timeBonusPoints',
      'hintPenaltyPoints',
      'leaderboardMode',
      'gameActive',
      'gameTitle',
      'gameSubtitle',
      'mapCenterLat',
      'mapCenterLng',
      'mapZoom',
      'allowRegistration',
      'shuffleTaskOrder',
      'hintRevealDelaySec',
      'locationRevealDelaySec',
      'boundaryRadiusMeters',
      'gameEndTime',
      'gameDurationMinutes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        config[field] = req.body[field];
      }
    });

    await config.save();
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// ██ TASKS MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/tasks – list ALL tasks (including inactive)
router.get('/tasks', async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort('order');
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/tasks – create a new task
router.post('/tasks', async (req, res, next) => {
  try {
    const {
      title, description, locationHint, detailedHint,
      points, order, lat, lng, mapLabel, isActive,
    } = req.body;

    if (!title || !description || !locationHint) {
      return res.status(400).json({ error: 'title, description, and locationHint are required' });
    }

    const task = await Task.create({
      title,
      description,
      locationHint,
      detailedHint: detailedHint || '',
      points: points || 100,
      order: order || 0,
      lat: lat || null,
      lng: lng || null,
      mapLabel: mapLabel || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/tasks/:id – update a task
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const allowedFields = [
      'title', 'description', 'locationHint', 'detailedHint',
      'points', 'order', 'lat', 'lng', 'mapLabel', 'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/tasks/:id – delete a task
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Also remove related submissions
    await Submission.deleteMany({ task: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// ██ PHOTO MODERATION
// ══════════════════════════════════════════════════════════════

// GET /api/admin/submissions – list all submissions with filters
router.get('/submissions', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.taskId) filter.task = req.query.taskId;

    const submissions = await Submission.find(filter)
      .populate('team', 'name avatarColor')
      .populate('task', 'title locationHint order')
      .sort('-photoSubmittedAt')
      .lean();

    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/submissions/:id/block – block a photo submission
router.put('/submissions/:id/block', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'blocked';
    submission.blockedAt = new Date();
    submission.blockedBy = req.teamId;
    submission.blockReason = req.body.reason || 'Blocked by admin';
    submission.photoPoints = 0;
    await submission.save();

    res.json({ message: 'Submission blocked', submission });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/submissions/:id/score – assign points to a photo submission
router.put('/submissions/:id/score', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const points = parseInt(req.body.points);
    if (isNaN(points) || points < 0) {
      return res.status(400).json({ error: 'Points must be a non-negative number' });
    }

    submission.photoPoints = points;
    submission.scoredAt = new Date();
    submission.scoredBy = req.teamId;
    await submission.save();

    res.json({ message: 'Photo scored', submission });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/submissions/:id/unblock – unblock a photo
router.put('/submissions/:id/unblock', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'completed';
    submission.blockedAt = null;
    submission.blockedBy = null;
    submission.blockReason = '';
    await submission.save();

    res.json({ message: 'Submission unblocked', submission });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/submissions/:id – delete the photo so team can re-upload
router.delete('/submissions/:id', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Delete the photo file from disk if it exists
    if (submission.photoUrl) {
      const filePath = path.join(__dirname, '..', submission.photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Reset to in-progress so the team can re-upload (timer keeps running)
    submission.photoUrl = null;
    submission.cloudinaryId = null;
    submission.photoSubmittedAt = null;
    submission.elapsedMs = null;
    submission.status = 'in-progress';
    submission.photoPoints = null;
    submission.scoredAt = null;
    submission.scoredBy = null;
    submission.blockedAt = null;
    submission.blockedBy = null;
    submission.blockReason = '';
    await submission.save();

    res.json({ message: 'Photo deleted — team can re-upload' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// ██ TEAMS MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/teams – list all teams (excluding admin)
router.get('/teams', async (_req, res, next) => {
  try {
    const teams = await Team.find({ role: { $ne: 'admin' } }).select('-password').sort('name');
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/teams – create a new team (admin-only team creation)
router.post('/teams', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const exists = await Team.findOne({ name });
    if (exists) return res.status(409).json({ error: 'Team name already taken' });

    const config = await GameConfig.getConfig();
    const tasks = await Task.find({ isActive: true }).select('_id order').sort('order');
    const ids = tasks.map((t) => t._id);
    if (config.shuffleTaskOrder) {
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
    }

    const team = await Team.create({ name, password, taskQueue: ids });
    res.status(201).json({
      _id: team._id,
      name: team.name,
      role: team.role,
      avatarColor: team.avatarColor,
      taskQueue: team.taskQueue,
      profileEdited: team.profileEdited,
      createdAt: team.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/teams/:id/reshuffle – generate new task queue for a team
router.put('/teams/:id/reshuffle', async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const tasks = await Task.find({ isActive: true }).select('_id order').sort('order');
    const ids = tasks.map((t) => t._id);

    // Fisher-Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    team.taskQueue = ids;
    await team.save();

    res.json({ message: 'Task queue reshuffled', taskQueue: ids });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/teams/:id – delete a team and all their submissions
router.delete('/teams/:id', async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin account' });
    }

    await Submission.deleteMany({ team: req.params.id });
    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// ██ DASHBOARD STATS
// ══════════════════════════════════════════════════════════════

// GET /api/admin/stats – overview stats for admin dashboard
router.get('/stats', async (_req, res, next) => {
  try {
    const [teamCount, taskCount, submissionCount, completedCount, blockedCount] =
      await Promise.all([
        Team.countDocuments({ role: 'team' }),
        Task.countDocuments(),
        Submission.countDocuments(),
        Submission.countDocuments({ status: 'completed' }),
        Submission.countDocuments({ status: 'blocked' }),
      ]);

    res.json({
      teams: teamCount,
      tasks: taskCount,
      submissions: submissionCount,
      completed: completedCount,
      blocked: blockedCount,
      inProgress: submissionCount - completedCount - blockedCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
