// ──────────────────────────────────────────────────────────────
// SideQuestSubmission – links a team, sidequest, and photo
// ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const sideQuestSubmissionSchema = new mongoose.Schema(
  {
    team:      { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest', required: true },

    photoUrl:  { type: String },

    // Admin review: pending → approved / rejected
    status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One submission per team per sidequest
sideQuestSubmissionSchema.index({ team: 1, sideQuest: 1 }, { unique: true });

module.exports = mongoose.model('SideQuestSubmission', sideQuestSubmissionSchema);
