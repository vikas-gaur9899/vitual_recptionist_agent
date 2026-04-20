const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

// STEP 1: Incoming Call - Handing over to WebSocket
router.post('/inbound', async (req, res) => {
  const { CallSid, From, To } = req.body;
  console.log(`📞 New Call Initialized: ${CallSid}`);

  try {
    // 1. Database mein entry (Initial state)
    await Call.create({
      callSid: CallSid,
      from: From,
      to: To,
      direction: 'inbound',
      status: 'in-progress',
      transcript: []
    });

    // 2. Twilio ko instruction: WebSocket connect karo
    // Note: AI_SERVICE_DOMAIN aapka ngrok URL hai (without https://)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Aditi">Namaste! Genesis Tech mein swagat hai. Main aapki kaise madad kar sakta hoon?</Say>
        <Connect>
          <Stream url="wss://${process.env.AI_SERVICE_DOMAIN}/media-stream">
            <Parameter name="callSid" value="${CallSid}" />
          </Stream>
        </Connect>
      </Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error("❌ Twilio Route Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;