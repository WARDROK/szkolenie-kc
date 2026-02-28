// ──────────────────────────────────────────────────────────────
// Auth middleware – verifies JWT from Authorization header
// ──────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.teamId = decoded.teamId;
    req.teamName = decoded.teamName;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
