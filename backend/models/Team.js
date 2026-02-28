// ──────────────────────────────────────────────────────────────
// Team model – represents a participating team
// ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 40,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    avatarColor: {
      type: String,
      default: '#00f0ff', // neon accent default
    },
  },
  { timestamps: true }
);

// Hash password before saving
teamSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method – verify password
teamSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Team', teamSchema);
