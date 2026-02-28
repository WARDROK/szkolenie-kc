// ──────────────────────────────────────────────────────────────
// Submission routes – photo upload & feed
// POST /api/submissions/:taskId/upload   → upload photo ★ stops timer
// GET  /api/submissions/feed             → public photo feed
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const { upload } = require('../config/upload');

// ★ Upload photo – STOPS the server-side timer
router.post('/:taskId/upload', auth, upload.single('photo'), async (req, res, next) => {
  try {
    const submission = await Submission.findOne({
      team: req.teamId,
      task: req.params.taskId,
    });

    if (!submission) {
      return res.status(400).json({ error: 'You must open the riddle before uploading' });
    }
    if (submission.status === 'completed') {
      return res.status(400).json({ error: 'Photo already submitted for this task' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // ── Stop timer (server-authoritative) ────────────────────
    const now = new Date();
    const elapsedMs = now - submission.riddleOpenedAt;

    submission.photoSubmittedAt = now;
    submission.elapsedMs = elapsedMs;
    // Build a URL the frontend can reach (works locally & in production)
    submission.photoUrl = `/uploads/${req.file.filename}`;
    submission.cloudinaryId = req.file.filename;
    submission.status = 'completed';
    await submission.save();

    res.json({
      message: 'Photo submitted!',
      submission: {
        id: submission._id,
        elapsedMs: submission.elapsedMs,
        photoUrl: submission.photoUrl,
        status: submission.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Public photo feed – all completed submissions (excludes blocked)
router.get('/feed', auth, async (_req, res, next) => {
  try {
    const feed = await Submission.find({
      status: 'completed',
      photoUrl: { $ne: null },
      blockedAt: null,
    })
      .populate('team', 'name avatarColor')
      .populate('task', 'title locationHint')
      .sort('-photoSubmittedAt')
      .limit(100)
      .lean();

    res.json(feed);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
