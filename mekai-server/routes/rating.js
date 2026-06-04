const express = require('express');
const router = express.Router();
const Diagnostic = require('../models/Diagnostic');

/**
 * POST /api/diagnose/:id/rate
 * Body: { rating: 'up' | 'down' }
 */
router.post('/:id/rate', async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (!['up', 'down'].includes(rating))
      return res.status(400).json({ success: false, error: 'Rating must be "up" or "down".' });

    const doc = await Diagnostic.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, error: 'Diagnostic introuvable.' });

    res.json({ success: true, rating: doc.rating });
  } catch (err) { next(err); }
});

module.exports = router;