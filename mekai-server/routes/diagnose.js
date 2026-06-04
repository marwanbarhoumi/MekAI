const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/upload');
const claudeService = require('../services/claudeService');
const Diagnostic = require('../models/Diagnostic');

// POST /api/diagnose — supporte jusqu'à 4 photos
router.post('/', upload.array('images', 4), async (req, res, next) => {
  try {
    const { problem, lang = 'fr', userId = 'anonymous' } = req.body;
    if (!problem?.trim())
      return res.status(400).json({ success: false, error: 'Le champ "problem" est requis.' });

    // Upload toutes les images sur Cloudinary
    let imageUrls = [];
    let imageBase64 = null;
    let mimeType = null;

    if (req.files?.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, f.mimetype))
      );
      // On envoie la première image à l'IA
      imageBase64 = req.files[0].buffer.toString('base64');
      mimeType = req.files[0].mimetype;
    }

    const result = await claudeService.diagnose({
      problem: problem.trim(), lang, imageBase64, mimeType,
    });

    // Essayer de sauvegarder dans MongoDB, mais continuer si ça échoue
    let doc;
    try {
      doc = await Diagnostic.create({
        userId, lang,
        problem: problem.trim(),
        imageUrl: imageUrls[0] || null,
        imageUrls,
        ...result,
      });
    } catch (dbErr) {
      console.warn('⚠️  Could not save to database:', dbErr.message);
      // Créer un faux ID pour la réponse
      doc = { _id: 'temp-' + Date.now() };
    }

    res.status(201).json({
      success: true,
      data: { id: doc._id, ...result, imageUrl: imageUrls[0] || null, imageUrls },
    });
  } catch (err) { next(err); }
});

// POST /api/diagnose/:id/followup
router.post('/:id/followup', async (req, res, next) => {
  try {
    const { question, lang = 'fr' } = req.body;
    if (!question?.trim())
      return res.status(400).json({ success: false, error: 'Le champ "question" est requis.' });

    const doc = await Diagnostic.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Diagnostic introuvable.' });

    const answer = await claudeService.followUp({
      question: question.trim(), lang,
      originalProblem: doc.problem,
      previousResult: { difficulty: doc.difficulty, diagnosis: doc.diagnosis, steps: doc.steps, next_step: doc.next_step },
    });

    doc.followups.push({ question: question.trim(), answer });
    await doc.save();
    res.json({ success: true, answer });
  } catch (err) { next(err); }
});

module.exports = router;