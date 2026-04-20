require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { LiveTranscriptionEvents } = require("@deepgram/sdk");

// Models & Routes
const Call = require('./src/models/Call');
const twilioRoutes = require('./src/routes/twilio.routes');
const { getAiResponse, summarizeConversation, deepgram } = require('./src/services/ai.service');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/voice', twilioRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected & AI Orchestrator Ready"))
  .catch(err => console.error("❌ DB Connection Failed:", err));

// Server Start
const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server live on port ${process.env.PORT || 5000}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/media-stream' });

wss.on('connection', (ws) => {
    console.log("🔗 Twilio Audio Stream Connected");

    let callSid = null;
    let history = [];

    // 🎙️ Deepgram Connection
    const dgConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-IN",
        encoding: "mulaw",
        sample_rate: 8000,
        interim_results: false
    });

    dgConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log("👂 AI is now listening...");

        dgConnection.on(LiveTranscriptionEvents.TranscriptReceived, async (data) => {
            try {
                const transcript = data?.channel?.alternatives?.[0]?.transcript;

                if (!transcript || transcript.trim().length === 0) return;

                console.log(`👤 User: ${transcript}`);

                // ✅ SAFE AI CALL
                let aiReply;
                try {
                    aiReply = await getAiResponse(transcript, history);
                } catch (err) {
                    console.error("❌ AI Error:", err);
                    aiReply = "Sorry, thoda issue aa gaya hai. Dobara bol sakte hain?";
                }

                console.log(`🤖 AI: ${aiReply}`);

                // 🧠 UPDATE MEMORY
                history.push({ role: "user", content: transcript });
                history.push({ role: "assistant", content: aiReply });

                // ✅ LIMIT MEMORY (IMPORTANT)
                if (history.length > 10) {
                    history = history.slice(-10);
                }

                // 🚨 NEXT STEP: TTS yahan lagega (don’t add now)

            } catch (err) {
                console.error("❌ Transcript Processing Error:", err);
            }
        });
    });

    // 📡 TWILIO STREAM HANDLING
    ws.on('message', async (message) => {
        try {
            const msg = JSON.parse(message);

            if (msg.event === 'start') {
                callSid = msg.start.callSid;
                console.log(`🚀 Stream started for CallSid: ${callSid}`);
            }

            if (msg.event === 'media') {
                const audioBuffer = Buffer.from(msg.media.payload, 'base64');
                dgConnection.send(audioBuffer);
            }

            if (msg.event === 'stop') {
                console.log("🏁 Call Ended. Summarizing...");

                if (history.length > 0 && callSid) {
                    try {
                        const summary = await summarizeConversation(history);

                        await Call.findOneAndUpdate(
                            { callSid },
                            {
                                summary,
                                status: 'completed'
                            }
                        );

                        console.log(`📝 Final Summary Saved`);
                    } catch (err) {
                        console.error("❌ Summary Save Error:", err);
                    }
                }

                dgConnection.finish();
            }

        } catch (err) {
            console.error("❌ WebSocket Message Error:", err);
        }
    });

    ws.on('close', () => {
        console.log("🔌 WebSocket Disconnected");
        try {
            dgConnection.finish();
        } catch (e) {}
    });

    ws.on('error', (err) => {
        console.error("❌ WebSocket Error:", err);
    });
});