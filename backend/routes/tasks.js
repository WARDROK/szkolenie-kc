// ──────────────────────────────────────────────────────────────
// Task routes
// GET  /api/tasks          → list all active tasks (summary)
// GET  /api/tasks/:id      → open a riddle  ★ starts the timer
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

// List all active tasks (no riddle text – just title + location)
router.get('/', auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ isActive: true })
      .select('title locationHint points order')
      .sort('order');

    // Attach the team's submission status for each task
    const submissions = await Submission.find({ team: req.teamId }).lean();
    const subMap = {};
    submissions.forEach((s) => {
      subMap[s.task.toString()] = s;
    });

    const enriched = tasks.map((t) => {
      const sub = subMap[t._id.toString()];
      return {
        ...t.toObject(),
        status: sub ? sub.status : 'not-started',
        elapsedMs: sub?.elapsedMs || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// ★ Open/view a single riddle – THIS STARTS THE SERVER-SIDE TIMER
router.get('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Upsert submission – only set riddleOpenedAt on first open
    let submission = await Submission.findOne({
      team: req.teamId,
      task: task._id,
    });

    if (!submission) {
      submission = await Submission.create({
        team: req.teamId,
        task: task._id,
        riddleOpenedAt: new Date(),
      });
    }

    res.json({
      task: task.toObject(),
      submission: {
        id: submission._id,
        riddleOpenedAt: submission.riddleOpenedAt,
        status: submission.status,
        elapsedMs: submission.elapsedMs,
        photoUrl: submission.photoUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
