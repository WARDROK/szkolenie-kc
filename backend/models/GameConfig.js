// ──────────────────────────────────────────────────────────────
// GameConfig model – singleton document for admin-editable settings
// ──────────────────────────────────────────────────────────────
// ★ EASY TO MODIFY: All game parameters live here.
//   Admin can change them via the admin panel or directly in DB.
// ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const gameConfigSchema = new mongoose.Schema(
  {
    // ── Points & Scoring ──────────────────────────────────────
    // Base points per task (can be overridden per-task)
    defaultTaskPoints: { type: Number, default: 100 },

    // Time bonus: if team completes under X seconds, bonus points
    timeBonusThresholdSec: { type: Number, default: 120 },  // 2 minutes
    timeBonusPoints: { type: Number, default: 50 },

    // Penalty for using a hint (subtracted from task points)
    hintPenaltyPoints: { type: Number, default: 0 },

    // ── Leaderboard Settings ──────────────────────────────────
    // 'fastest' = rank by shortest total time
    // 'most-tasks' = rank by most completed tasks first, then time
    leaderboardMode: {
      type: String,
      enum: ['fastest', 'most-tasks'],
      default: 'most-tasks',
    },

    // ── Game State ────────────────────────────────────────────
    gameActive: { type: Boolean, default: true },
    gameTitle: { type: String, default: 'Scavenger Hunt 2026' },
    gameSubtitle: { type: String, default: 'Conference Edition' },

    // ── Map Settings ──────────────────────────────────────────
    // Default map center (set to your venue location)
    mapCenterLat: { type: Number, default: 52.2297 },   // Warsaw default
    mapCenterLng: { type: Number, default: 21.0122 },
    mapZoom: { type: Number, default: 17 },

    // ── Registration ──────────────────────────────────────────
    allowRegistration: { type: Boolean, default: true },

    // ── Task Queue ────────────────────────────────────────────
    // If true, each team gets a shuffled order of tasks
    shuffleTaskOrder: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Helper: Always return the single config document ────────
gameConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('GameConfig', gameConfigSchema);
