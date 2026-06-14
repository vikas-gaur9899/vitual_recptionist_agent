const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

// ── Inbound/Outbound: greet + open WebSocket stream ──
router.post('/inbound', async (req, res) => {
  const { CallSid, From, To, Direction } = req.body;

  // ✅ Twilio outbound calls ka Direction = "outbound-api"
  const isOutbound = Direction === "outbound-api";

  // ✅ Customer number hamesha "from" mein store hoga, chahe call kaise bhi hui ho
  const customerNumber = isOutbound ? To   : From;
  const businessNumber = isOutbound ? From : To;

  console.log(`📞 New Call: ${CallSid} | Customer: ${customerNumber} | Direction: ${Direction}`);

  Call.create({
    callSid: CallSid,
    from: customerNumber,                         // ✅ always customer number
    to: businessNumber,                           // ✅ always twilio/business number
    direction: isOutbound ? 'outbound-api' : 'inbound', // ✅ proper tag
    status: 'in-progress',
    transcript: []
  }).catch(err => console.error("DB Error:", err));

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Hello! Thank you for calling Genesis Ed-Tech. I'm Priya, how can I help you today?</Say>
  <Connect>
    <Stream url="wss://${process.env.AI_SERVICE_DOMAIN}/media-stream">
      <Parameter name="callSid" value="${CallSid}"/>
      <Parameter name="from" value="${customerNumber}"/>
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