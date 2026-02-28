// ──────────────────────────────────────────────────────────────
// Auth routes – register & login (team-based, simple)
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

const signToken = (team) =>
  jwt.sign(
    { teamId: team._id, teamName: team.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Team name and password are required' });
    }

    const exists = await Team.findOne({ name });
    if (exists) return res.status(409).json({ error: 'Team name already taken' });

    const team = await Team.create({ name, password });
    const token = signToken(team);

    res.status(201).json({
      token,
      team: { id: team._id, name: team.name, avatarColor: team.avatarColor },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const team = await Team.findOne({ name });
    if (!team) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await team.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(team);
    res.json({
      token,
      team: { id: team._id, name: team.name, avatarColor: team.avatarColor },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
