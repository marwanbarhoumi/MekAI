const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: 'Email déjà utilisé.' });

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) { next(err); }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, error: 'Identifiants incorrects.' });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/auth/me  (protected)
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;