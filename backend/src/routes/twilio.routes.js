const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

// ── Inbound: greet + open WebSocket stream ──
router.post('/inbound', async (req, res) => {
  const { CallSid, From, To } = req.body;
  console.log(`📞 New Call: ${CallSid} | From: ${From}`);

  Call.create({
    callSid: CallSid,
    from: From,
    to: To,
    direction: 'inbound',
    status: 'in-progress',
    transcript: []
  }).catch(err => console.error("DB Error:", err));

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Hello! Thank you for calling Genesis Ed-Tech. I'm Priya, how can I help you today?</Say>
  <Connect>
    <Stream url="wss://${process.env.AI_SERVICE_DOMAIN}/media-stream">
      <Parameter name="callSid" value="${CallSid}"/>
      <Parameter name="from" value="${From}"/>
    </Stream>
  </Connect>
</Response>`;

  res.type('text/xml').send(twiml);
});

// ── Status webhook ──
router.post('/status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  console.log(`📵 ${CallSid} | ${CallStatus} | ${CallDuration}s`);

  Call.findOneAndUpdate(
    { callSid: CallSid },
    { status: CallStatus, duration: Number(CallDuration) || 0 }
  ).catch(err => console.error("Status error:", err));

  res.sendStatus(200);
});

module.exports = router;