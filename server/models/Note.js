const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  usageCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  category: { type: String, default: 'General' },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
