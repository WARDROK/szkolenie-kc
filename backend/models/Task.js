// ──────────────────────────────────────────────────────────────
// Task model – a single scavenger hunt challenge / riddle
// ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },          // riddle text
    locationHint: { type: String, required: true },          // general area
    detailedHint: { type: String, default: '' },             // revealed on tap
    points: { type: Number, default: 100 },
    order: { type: Number, default: 0 },                     // display order
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
