const StateSnapshot = require('../models/StateSnapshot');

class StateManager {
  constructor(NoteModel) {
    this.Note = NoteModel;
  }

  async saveState(userId, notesData) {
    const existingNotes = await this.Note.find({ userId });
    const existingIds = existingNotes.map(n => n._id.toString());
    const incomingIds = notesData.filter(n => n._id).map(n => n._id.toString());

    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await this.Note.deleteMany({ _id: { $in: idsToDelete }, userId });
    }

    for (let note of notesData) {
      if (note._id && existingIds.includes(note._id.toString())) {
        await this.Note.findByIdAndUpdate(note._id, {
          title: note.title,
          content: note.content,
          usageCount: note.usageCount,
          isPinned: note.isPinned || false,
          category: note.category || 'General',
          isArchived: note.isArchived || false
        });
      } else {
        await this.Note.create({
          userId,
          title: note.title,
          content: note.content,
          usageCount: note.usageCount || 0,
          isPinned: note.isPinned || false,
          category: note.category || 'General',
          isArchived: note.isArchived || false
        });
      }
    }
    return { success: true };
  }

  async loadState(userId) {
    return await this.Note.find({ userId });
  }

  async saveSnapshot(userId, stateObj, sessionId, label = 'Auto-save') {
    const latest = await StateSnapshot.findOne({ userId }).sort({ version: -1 });
    const nextVersion = latest ? latest.version + 1 : 1;

    const snapshot = await StateSnapshot.create({
      userId,
      snapshot: stateObj,
      version: nextVersion,
      label,
      sessionId,
      isCleanExit: false
    });

    const count = await StateSnapshot.countDocuments({ userId });
    if (count > 50) {
      const cutoff = await StateSnapshot.find({ userId })
        .sort({ version: -1 })
        .skip(50)
        .limit(1);
      if (cutoff.length > 0) {
        await StateSnapshot.deleteMany({
          userId,
          version: { $lte: cutoff[0].version }
        });
      }
    }

    return { version: snapshot.version, id: snapshot._id };
  }

  async getVersionHistory(userId, limit = 20) {
    return await StateSnapshot.find({ userId })
      .select('version label sessionId isCleanExit createdAt')
      .sort({ version: -1 })
      .limit(limit);
  }

  async restoreVersion(userId, version) {
    const snap = await StateSnapshot.findOne({ userId, version });
    if (!snap) return null;
    return snap.snapshot;
  }

  async checkCrash(userId, currentSessionId) {
    const crashed = await StateSnapshot.findOne({
      userId,
      isCleanExit: false,
      sessionId: { $ne: currentSessionId }
    }).sort({ createdAt: -1 });

    if (!crashed) return null;
    return {
      version: crashed.version,
      sessionId: crashed.sessionId,
      createdAt: crashed.createdAt,
      snapshot: crashed.snapshot
    };
  }

  async markCleanExit(userId, sessionId) {
    await StateSnapshot.updateMany(
      { userId, sessionId },
      { $set: { isCleanExit: true } }
    );
    return { success: true };
  }
}

module.exports = StateManager;
