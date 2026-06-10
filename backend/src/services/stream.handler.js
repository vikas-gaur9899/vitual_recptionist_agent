const { DeepgramClient } = require("@deepgram/sdk");
const { getAiResponse, summarizeConversation } = require("./ai.service");
const Call = require("../models/Call");
const Lead = require("../models/Lead");
const {
  assignLeadAutomatically
} = require("./leadAssignment.service");
const { logActivity } = require("./activity.service"); // ✅ ADDED

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

// ── Global session store — never cleans up until call truly ends ──
const callSessions = {};

function getSession(callSid, callerPhone) {
  if (!callSessions[callSid]) {
    callSessions[callSid] = {
      history: [],
      userDetails: { name: null, phone: null, interest: null },
      callerPhone: callerPhone || null,
      greeted: false,
      leadCreated: false,
      reconnectCount: 0,
      callEndedAt: null,
    };
    console.log(`🆕 New session: ${callSid}`);
  } else {
    callSessions[callSid].reconnectCount++;
    // Update phone if we now have it
    if (callerPhone && !callSessions[callSid].callerPhone) {
      callSessions[callSid].callerPhone = callerPhone;
    }
    console.log(`🔄 Reconnect #${callSessions[callSid].reconnectCount} for: ${callSid}`);
    console.log(`📝 Session state — Name: ${callSessions[callSid].userDetails.name} | Greeted: ${callSessions[callSid].greeted}`);
  }
  return callSessions[callSid];
}

module.exports = async function handleMediaStream(ws) {
  console.log("🔗 Media stream connected");

  let connection;
  let callSid = null;
  let session = null;
  let isSpeaking = false;
  let callEnded = false;

  const audioQueue = [];
  let deepgramReady = false;

  async function injectSpeech(text) {
    try {
      if (!callSid) { console.log("❌ No CallSid"); return; }

      const client = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      console.log("🔊 Speaking:", text);

      await client.calls(callSid).update({
        twiml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">${escapeXml(text)}</Say>
  <Connect>
    <Stream url="wss://${process.env.AI_SERVICE_DOMAIN}/media-stream">
      <Parameter name="callSid" value="${callSid}"/>
      <Parameter name="from" value="${session?.callerPhone || ''}"/>
    </Stream>
  </Connect>
</Response>`
      });

      console.log("✅ Speech injected");
      const ms = Math.max(1500, (text.split(" ").length / 2.5) * 1000);
      setTimeout(() => { isSpeaking = false; }, ms);

    } catch (err) {
      console.error("❌ TTS error:", err.message);
      isSpeaking = false;
    }
  }

  async function handleLeadCreation() {
    if (!session || session.leadCreated) return;
    const phone = session.userDetails.phone || session.callerPhone;
    if (!session.userDetails.name && !phone) return;

    try {
      session.leadCreated = true;
      const phone = session.userDetails.phone || session.callerPhone || "Unknown";
      const executive = await assignLeadAutomatically();

      const lead = await Lead.findOneAndUpdate(
        { phoneNumber: phone },
        {
          phoneNumber: phone,

          name:
            session.userDetails.name ||
            "Prospect",

          interest:
            session.userDetails.interest ||
            "General Inquiry",

          summary:
            session.history.length > 0
              ? session.history
                  .filter(h => h.role === "user")
                  .map(h => h.content)
                  .join(", ")
                  .slice(0, 200)
              : "No summary",

          sourceCall:
            callSid,

          status:
            executive
              ? "Assigned"
              : "New",

          priority:
            session.userDetails.interest
              ? "High"
              : "Medium",

          assignedTo:
            executive
              ? executive._id
              : null,

          assignedAt:
            executive
              ? new Date()
              : null
        },
        {
          upsert: true,
          returnDocument: "after"
        }
      );

      await Call.findOneAndUpdate(
        { callSid },
        { leadGenerated: true, leadId: lead._id }
      );

      console.log(`✅ Lead saved: ${lead._id} | Name: ${lead.name} | Interest: ${lead.interest}`);

      // ✅ ACTIVITY LOG — lead assign hone pe track karo
      await logActivity({
        user: {
          _id: executive?._id || null,
          name: executive?.name || "AI SYSTEM",
          role: executive?.role || "system"
        },
        action: "ASSIGN_LEAD",
        entityType: "lead",
        entityId: lead._id,
        customerName: lead.name || "Prospect",
        customerPhone: phone,
        summary: executive
          ? `Lead auto-assigned via AI call to ${executive.name}`
          : "Lead created via AI call — no executive available"
      });

      console.log(`📋 Activity logged for lead: ${lead._id}`);

    } catch (err) {
      console.error("❌ Lead error:", err.message);
      session.leadCreated = false;
    }
  }

  async function handleCallEnd() {
    if (callEnded || !callSid) return;
    callEnded = true;

    const sid = callSid;
    console.log(`📊 Processing end of call: ${sid}`);

    if (!session) {
      console.log("⚠️ No session found for call end");
      return;
    }

    // Mark call end time
    session.callEndedAt = Date.now();

    // Save lead if we have any user info
    if (session.userDetails.name || session.userDetails.interest || session.userDetails.phone || session.callerPhone) {
      await handleLeadCreation();
    }

    if (session.history.length > 0) {
      try {
        const analysis = await summarizeConversation(session.history);
        console.log("📊 Analysis:", analysis);

        await Call.findOneAndUpdate(
          { callSid: sid },
          {
            status: "completed",
            summary: analysis.summary,
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            leadGenerated: analysis.leadGenerated
          }
        );

        if (analysis.leadGenerated && !session.leadCreated) {
          await handleLeadCreation();
        }

      } catch (err) {
        console.error("❌ End save error:", err.message);
      }
    }

    // ── Clean session after 5 minutes (not 30s) ──
    // Gives enough time for Twilio status webhook
    setTimeout(() => {
      if (callSessions[sid]) {
        delete callSessions[sid];
        console.log(`🗑️ Session cleaned: ${sid}`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // ── STEP 1: Register WS handler FIRST ──
  ws.on("message", (message) => {
    try {
      let msg;
      try { msg = JSON.parse(message.toString()); }
      catch (err) { return; }

      if (msg.event === "start") {
        callSid = msg?.start?.customParameters?.callSid
               || msg?.start?.callSid
               || null;

        const callerPhone = msg?.start?.customParameters?.from || null;
        session = getSession(callSid, callerPhone);
      }

      if (msg.event === "media") {
        const audioBuffer = Buffer.from(msg.media.payload, "base64");
        if (deepgramReady && connection) {
          while (audioQueue.length > 0) connection.sendMedia(audioQueue.shift());
          connection.sendMedia(audioBuffer);
        } else {
          audioQueue.push(audioBuffer);
        }
      }

      if (msg.event === "stop") {
        console.log("🏁 Stream stopped");
        try { connection.sendFinalize({ type: "Finalize" }); connection.close(); } catch (e) {}
        handleCallEnd();
      }

    } catch (err) {
      console.error("❌ WS error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket closed");
    // Don't call handleCallEnd here — stream reconnects trigger close
    // Only handle end on actual "stop" event or status webhook
    try { connection.close(); } catch (e) {}
  });

  // ── STEP 2: Connect Deepgram ──
  try {
    connection = await deepgram.listen.v1.connect({
      model: "nova-3",
      language: "multi",
      punctuate: true,
      interim_results: true,
      encoding: "mulaw",
      sample_rate: 8000,
      endpointing: 300,
    });

    connection.on("open", () => {
      console.log("🎧 Deepgram connected");
      deepgramReady = true;
      while (audioQueue.length > 0) connection.sendMedia(audioQueue.shift());
    });

    connection.on("message", async (data) => {
      try {
        if (data.type !== "Results") return;
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (!transcript) return;

        console.log("🧠 Raw:", transcript);
        if (!data.is_final || isSpeaking) return;

        console.log("👤 User:", transcript);
        isSpeaking = true;

        const { reply, extractedData } = await getAiResponse(
          transcript,
          session.history,
          session.userDetails,
          session.greeted
        );

        session.greeted = true;

        console.log("🤖 AI:", reply);
        if (Object.keys(extractedData).length > 0) {
          console.log("📦 Extracted:", extractedData);
        }

        // Update userDetails
        if (extractedData.name) {
          session.userDetails.name = extractedData.name;
          console.log("👤 Name confirmed:", session.userDetails.name);
        }
        if (extractedData.phone) {
          session.userDetails.phone = extractedData.phone;
          console.log("📱 Phone captured:", session.userDetails.phone);
        }
        if (extractedData.interest) {
          session.userDetails.interest = extractedData.interest;
          console.log("🎯 Interest:", session.userDetails.interest);
        }

        if (extractedData.interested === true) {
          console.log("🔥 Lead trigger!");
          await handleLeadCreation();
        }

        // Update history
        session.history.push(
          { role: "user",      content: transcript },
          { role: "assistant", content: reply }
        );
        if (session.history.length > 12) session.history = session.history.slice(-12);

        // Save transcript
        Call.findOneAndUpdate(
          { callSid },
          { $push: { transcript: { $each: [
            { role: "user",      text: transcript },
            { role: "assistant", text: reply }
          ]}}}
        ).catch(() => {});

        await injectSpeech(reply);

      } catch (err) {
        console.error("❌ Transcript error:", err.message);
        isSpeaking = false;
      }
    });

    connection.on("error", (err) => console.error("❌ Deepgram error:", err));
    connection.on("close", () => console.log("🔌 Deepgram closed"));

    connection.connect();
    await connection.waitForOpen();

  } catch (err) {
    console.error("❌ Deepgram init error:", err);
  }
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}