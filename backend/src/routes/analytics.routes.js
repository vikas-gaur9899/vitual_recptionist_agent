const express = require('express');
const router  = express.Router();
const Call    = require('../models/Call');
const Lead    = require('../models/Lead');
const { protect } = require('../middleware/auth.middleware');

// ── Main analytics ──
router.get('/', protect, async (req, res) => {
  try {
    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalCalls, todayCalls, totalLeads] = await Promise.all([
      Call.countDocuments(),
      Call.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments(),
    ]);

    const conversionRate = totalCalls > 0
      ? Math.round((totalLeads / totalCalls) * 100) : 0;

    const durationAgg = await Call.aggregate([
      { $match: { duration: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);
    const avgSecs = durationAgg[0]?.avg || 0;
    const avgDuration = avgSecs > 0
      ? `${Math.floor(avgSecs / 60)}m ${Math.round(avgSecs % 60)}s` : '—';

    const sentimentAgg = await Call.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    sentimentAgg.forEach(s => {
      if (s._id === 'Positive') sentiment.positive = s.count;
      if (s._id === 'Neutral')  sentiment.neutral  = s.count;
      if (s._id === 'Negative') sentiment.negative = s.count;
    });

    const scoreAgg = await Lead.aggregate([
      { $group: { _id: '$leadScore', count: { $sum: 1 } } }
    ]);
    const leadScore = { hot: 0, warm: 0, cold: 0 };
    scoreAgg.forEach(s => {
      if (s._id === 'Hot')  leadScore.hot  = s.count;
      if (s._id === 'Warm') leadScore.warm = s.count;
      if (s._id === 'Cold') leadScore.cold = s.count;
    });

    const courseInterest = await Lead.aggregate([
      { $match: { interest: { $exists: true, $ne: null, $ne: 'General Inquiry' } } },
      { $group: { _id: '$interest', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

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

    // ── Not Converted stats ──
    const notConvertedByReason = await Lead.aggregate([
      { $match: { status: "Not Converted", notConvertedReason: { $exists: true, $ne: null } } },
      { $group: { _id: "$notConvertedReason", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const notConvertedByCourse = await Lead.aggregate([
      { $match: { status: "Not Converted", interest: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$interest",
          count: { $sum: 1 },
          reasons: { $push: "$notConvertedReason" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Converted by course
    const convertedByCourse = await Lead.aggregate([
      { $match: { status: "Converted", interest: { $exists: true, $ne: null } } },
      { $group: { _id: "$interest", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalCalls, todayCalls, totalLeads,
      conversionRate, avgDuration,
      sentiment, leadScore,
      courseInterest, weekCalls: weekData,
      notConvertedByReason,
      notConvertedByCourse,
      convertedByCourse
    });

  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;