// ──────────────────────────────────────────────────────────────
// Admin-only Middleware
// Must be used AFTER auth middleware
// ──────────────────────────────────────────────────────────────
module.exports = function adminOnly(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
