// ──────────────────────────────────────────────────────────────
// SideQuest model – optional bonus challenge (no timer)
// ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const sideQuestSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SideQuest', sideQuestSchema);
