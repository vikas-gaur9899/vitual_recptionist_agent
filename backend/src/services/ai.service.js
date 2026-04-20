const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const getAiResponse = async (text, history = []) => {
    try {
        const messages = [
            { role: "system", content: "You are a helpful assistant for Genesis Tech. Speak in Hinglish." },
            ...history,
            { role: "user", content: text }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama3-70b-8192",
        });

        return chatCompletion.choices[0].message.content;

    } catch (error) {
        console.error("❌ AI Error:", error);
        return "Sorry, thoda issue aa gaya hai. Kya aap dobara bol sakte hain?";
    }
};

const setupDeepgram = (socket) => {
    const dgConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-IN",
        smart_format: true,
        encoding: "mulaw",
        sample_rate: 8000,
    });

    dgConnection.on(LiveTranscriptionEvents.TranscriptReceived, async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript) {
            console.log("👤 User said:", transcript);
            const reply = await getAiResponse(transcript);
            console.log("🤖 AI replied:", reply);
            // Day 4 mein yahan se TTS call karenge
        }
    });

    return dgConnection;
};

const summarizeConversation = async (history) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Summarize this conversation in 2-3 lines." },
                { role: "user", content: JSON.stringify(history) }
            ],
            model: "llama3-70b-8192",
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("❌ Summary Error:", error);
        return "Summary not available";
    }
};

module.exports = {
    getAiResponse,
    summarizeConversation,
    deepgram
};