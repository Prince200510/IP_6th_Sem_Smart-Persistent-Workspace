const mongoose = require('mongoose');

const StateSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  version: { type: Number, required: true },
  label: { type: String, default: 'Auto-save' },
  sessionId: { type: String, required: true },
  isCleanExit: { type: Boolean, default: false }
}, { timestamps: true });

StateSnapshotSchema.index({ userId: 1, version: -1 });
StateSnapshotSchema.index({ userId: 1, sessionId: 1, isCleanExit: 1 });

module.exports = mongoose.model('StateSnapshot', StateSnapshotSchema);
