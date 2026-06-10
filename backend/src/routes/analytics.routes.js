const express = require('express');
const router  = express.Router();
const Call    = require('../models/Call');
const Lead    = require('../models/Lead');
const User    = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, async (req, res) => {
  try {
    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // ── Basic counts ──
    const [
      totalCalls,
      todayCalls,
      totalLeads,
      convertedLeads,
      complaints,
      followUps,
      totalExecutives
    ] = await Promise.all([
      Call.countDocuments(),
      Call.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "Converted" }),
      Lead.countDocuments({ type: "complaint" }),
      Lead.countDocuments({ status: "Follow-up" }),
      User.countDocuments({ role: "executive", isActive: true })
    ]);

    // ── Conversion rate ──
    const conversionRate = totalLeads > 0
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    // ── Avg call duration ──
    const durationAgg = await Call.aggregate([
      { $match: { duration: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);
    const avgSecs     = durationAgg[0]?.avg || 0;
    const avgDuration = avgSecs > 0
      ? `${Math.floor(avgSecs / 60)}m ${Math.round(avgSecs % 60)}s`
      : '—';

    // ── Sentiment breakdown ──
    const sentimentAgg = await Call.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    sentimentAgg.forEach(s => {
      if (s._id === 'Positive') sentiment.positive = s.count;
      if (s._id === 'Neutral')  sentiment.neutral  = s.count;
      if (s._id === 'Negative') sentiment.negative = s.count;
    });

    // ── Lead score breakdown ──
    const scoreAgg = await Lead.aggregate([
      { $group: { _id: '$leadScore', count: { $sum: 1 } } }
    ]);
    const leadScore = { hot: 0, warm: 0, cold: 0 };
    scoreAgg.forEach(s => {
      if (s._id === 'Hot')  leadScore.hot  = s.count;
      if (s._id === 'Warm') leadScore.warm = s.count;
      if (s._id === 'Cold') leadScore.cold = s.count;
    });

    // ── Course interest ──
    const courseInterest = await Lead.aggregate([
      { $match: { interest: { $exists: true, $ne: null, $ne: 'General Inquiry' } } },
      { $group: { _id: '$interest', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // ── Week calls ──
    const weekCalls = await Call.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    const weekData = [0, 0, 0, 0, 0, 0, 0];
    weekCalls.forEach(d => {
      const idx = (d._id + 5) % 7;
      weekData[idx] = d.count;
    });

    res.json({
      totalCalls,
      todayCalls,
      totalLeads,
      convertedLeads,
      complaints,
      followUps,
      totalExecutives,
      conversionRate,
      avgDuration,
      sentiment,
      leadScore,
      courseInterest,
      weekCalls: weekData,
    });

  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;