// ──────────────────────────────────────────────────────────────
// Public Game Config route – returns non-sensitive settings
// GET /api/config
// ──────────────────────────────────────────────────────────────
const router = require('express').Router();
const GameConfig = require('../models/GameConfig');

router.get('/', async (_req, res, next) => {
  try {
    const config = await GameConfig.getConfig();
    res.json({
      gameTitle: config.gameTitle,
      gameSubtitle: config.gameSubtitle,
      gameActive: config.gameActive,
      mapCenterLat: config.mapCenterLat,
      mapCenterLng: config.mapCenterLng,
      mapZoom: config.mapZoom,
      allowRegistration: config.allowRegistration,
      leaderboardMode: config.leaderboardMode,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
