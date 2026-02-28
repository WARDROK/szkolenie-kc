// ──────────────────────────────────────────────────────────────
// Task routes
// GET  /api/tasks          → list tasks in team's queue order
// GET  /api/tasks/:id      → view task details (no timer start)
// POST /api/tasks/:id/start → explicitly START the timer ★
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const Task = require('../models/Task');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

// List all active tasks in this team's queue order
router.get('/', auth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.teamId);
    const allTasks = await Task.find({ isActive: true })
      .select('title locationHint points order lat lng mapLabel')
      .lean();

    // Build a map of tasks by ID
    const taskMap = {};
    allTasks.forEach((t) => { taskMap[t._id.toString()] = t; });

    // Attach the team's submission status for each task
    const submissions = await Submission.find({ team: req.teamId }).lean();
    const subMap = {};
    submissions.forEach((s) => { subMap[s.task.toString()] = s; });

    // If team has a taskQueue, use that order; otherwise fall back to default order
    let orderedTasks;
    if (team && team.taskQueue && team.taskQueue.length > 0) {
      orderedTasks = team.taskQueue
        .map((id) => taskMap[id.toString()])
        .filter(Boolean); // filter out any removed tasks

      // Add any new tasks not in the queue yet
      const queueSet = new Set(team.taskQueue.map((id) => id.toString()));
      const newTasks = allTasks.filter((t) => !queueSet.has(t._id.toString()));
      orderedTasks = orderedTasks.concat(newTasks);
    } else {
      orderedTasks = allTasks.sort((a, b) => a.order - b.order);
    }

    const enriched = orderedTasks.map((t, index) => {
      const sub = subMap[t._id.toString()];
      return {
        ...t,
        queuePosition: index + 1,  // team-specific order number
        status: sub ? sub.status : 'not-started',
        elapsedMs: sub?.elapsedMs || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// View a single task detail – does NOT start the timer
router.get('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if there's an existing submission
    const submission = await Submission.findOne({
      team: req.teamId,
      task: task._id,
    });

    res.json({
      task: task.toObject(),
      submission: submission
        ? {
            id: submission._id,
            riddleOpenedAt: submission.riddleOpenedAt,
            status: submission.status,
            elapsedMs: submission.elapsedMs,
            photoUrl: submission.photoUrl,
          }
        : null, // null means task hasn't been started yet
    });
  } catch (err) {
    next(err);
  }
});

// ★ START the task – creates the submission and starts the server-side timer
// POST /api/tasks/:id/start
router.post('/:id/start', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if already started
    let submission = await Submission.findOne({
      team: req.teamId,
      task: task._id,
    });

    if (submission) {
      // Already started – just return current state
      return res.json({
        task: task.toObject(),
        submission: {
          id: submission._id,
          riddleOpenedAt: submission.riddleOpenedAt,
          status: submission.status,
          elapsedMs: submission.elapsedMs,
          photoUrl: submission.photoUrl,
        },
      });
    }

    // Create new submission – THIS STARTS THE TIMER
    submission = await Submission.create({
      team: req.teamId,
      task: task._id,
      riddleOpenedAt: new Date(),
    });

    res.status(201).json({
      task: task.toObject(),
      submission: {
        id: submission._id,
        riddleOpenedAt: submission.riddleOpenedAt,
        status: submission.status,
        elapsedMs: null,
        photoUrl: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
