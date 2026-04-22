class RecommendationEngine {
  constructor(NoteModel) {
    this.Note = NoteModel;
  }

  async rankAndSearch(userId, query) {
    const notes = await this.Note.find({ userId });
    const lowerQuery = query.toLowerCase();

    return notes
      .map(note => {
        let score = note.usageCount;
        if (note.title.toLowerCase().includes(lowerQuery)) score += 15;
        if (note.content.toLowerCase().includes(lowerQuery)) score += 5;
        return { note, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.note);
  }

  async recommend(userId) {
    return await this.Note.find({ userId })
      .sort({ usageCount: -1 })
      .limit(5);
  }
}

module.exports = RecommendationEngine;
