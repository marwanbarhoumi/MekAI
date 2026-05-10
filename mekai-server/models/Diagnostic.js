const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
  userId:    { type: String, default: 'anonymous' },
  lang:      { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
  problem:   { type: String, required: true },
  imageUrl:  { type: String, default: null },

  // Résultat du diagnostic IA
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  diagnosis:  { type: String },
  steps:      [{ type: String }],
  next_step:  { type: String },

  // Conversation de suivi
  followups: [{
    question: String,
    answer:   String,
    createdAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

module.exports = mongoose.model('Diagnostic', diagnosticSchema);