const express = require('express');
const router  = express.Router();
const Call    = require('../models/Call');
const { protect } = require('../middleware/auth.middleware');

// ── GET ALL CALLS
router.get('/', protect, async (req, res) => {
  try {
    const { status, intent, sentiment, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (status)    filter.status    = status;
    if (intent)    filter.intent    = intent;
    if (sentiment) filter.sentiment = sentiment;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Call.countDocuments(filter);
    const calls = await Call.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('leadId', 'name phoneNumber leadScore');

    res.json({ calls, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get calls error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET SINGLE CALL
router.get('/:id', protect, async (req, res) => {
  try {
    const call = await Call.findById(req.params.id).populate('leadId');
    if (!call) return res.status(404).json({ message: 'Call not found' });
    res.json({ call });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;