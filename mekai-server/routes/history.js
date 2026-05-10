const express = require('express');
const router = express.Router();
const Diagnostic = require('../models/Diagnostic');

/**
 * GET /api/history/:userId
 * Retourne les 20 derniers diagnostics d'un utilisateur
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const docs = await Diagnostic.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('problem difficulty diagnosis imageUrl createdAt');

    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/history/:userId/:id
 * Retourne un diagnostic complet avec ses followups
 */
router.get('/:userId/:id', async (req, res, next) => {
  try {
    const doc = await Diagnostic.findOne({
      _id: req.params.id,
      userId: req.params.userId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Diagnostic introuvable.' });
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

module.exports = router;