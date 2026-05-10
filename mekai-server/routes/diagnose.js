const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/upload');
const claudeService = require('../services/claudeService');
const Diagnostic = require('../models/Diagnostic');

/**
 * POST /api/diagnose
 * Body: multipart/form-data
 *   - problem (string, required)
 *   - lang    (string: fr|ar|en, default: fr)
 *   - image   (file, optional)
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { problem, lang = 'fr', userId = 'anonymous' } = req.body;

    if (!problem || !problem.trim()) {
      return res.status(400).json({ success: false, error: 'Le champ "problem" est requis.' });
    }

    // Upload image sur Cloudinary si présente
    let imageUrl = null;
    let imageBase64 = null;
    const mimeType = req.file?.mimetype || null;

    if (req.file) {
      imageUrl    = await uploadToCloudinary(req.file.buffer, mimeType);
      imageBase64 = req.file.buffer.toString('base64');
    }

    // Appel Claude
    const result = await claudeService.diagnose({
      problem: problem.trim(),
      lang,
      imageBase64,
      mimeType,
    });

    // Sauvegarde en base
    const doc = await Diagnostic.create({
      userId,
      lang,
      problem: problem.trim(),
      imageUrl,
      ...result,
    });

    res.status(201).json({
      success: true,
      data: { id: doc._id, ...result, imageUrl },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/diagnose/:id/followup
 * Body JSON: { question, lang }
 */
router.post('/:id/followup', async (req, res, next) => {
  try {
    const { question, lang = 'fr' } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Le champ "question" est requis.' });
    }

    const doc = await Diagnostic.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Diagnostic introuvable.' });
    }

    const answer = await claudeService.followUp({
      question: question.trim(),
      lang,
      originalProblem: doc.problem,
      previousResult: {
        difficulty: doc.difficulty,
        diagnosis:  doc.diagnosis,
        steps:      doc.steps,
        next_step:  doc.next_step,
      },
    });

    doc.followups.push({ question: question.trim(), answer });
    await doc.save();

    res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

module.exports = router;