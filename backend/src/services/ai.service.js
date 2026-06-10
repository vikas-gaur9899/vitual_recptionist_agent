const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { getKnowledgeBase } = require( "./knowledge.service" );

const getAiResponse = async (text, history = [], userDetails = {}, greeted = false,customerMemory = null) => {
  try {
    const knowledgeBase = await getKnowledgeBase();
    const knownDetails = [];
    if (userDetails.name)     knownDetails.push(`User name: ${userDetails.name}`);
    if (userDetails.phone)    knownDetails.push(`User phone: ${userDetails.phone}`);
    if (userDetails.interest) knownDetails.push(`User interest: ${userDetails.interest}`);
    if (userDetails.location) knownDetails.push(`User location: ${userDetails.location}`);
    if (userDetails.mode)     knownDetails.push(`User prefers: ${userDetails.mode}`);

    const userContext = knownDetails.length > 0
      ? `\nCOLLECTED SO FAR:\n${knownDetails.join('\n')}`
      : '';

      const memoryContext = customerMemory
  ? `
PREVIOUS CUSTOMER MEMORY:

Customer Name: ${customerMemory.customerName || ""}

Previous Interest: ${customerMemory.interest || ""}

Last Intent: ${customerMemory.lastIntent || ""}

Previous Summary: ${customerMemory.summary || ""}
`
  : "";
    const greetInstruction = greeted
      ? `IMPORTANT: You have ALREADY greeted. NEVER say Hello, Thank you for calling, or I am Priya again. Just continue naturally.`
      : `This is the FIRST message. Say exactly: "Hello! Thank you for calling Genesis Ed-Tech. I am Priya, how can I help you today?"`;

    const nameInstruction = userDetails.name
      ? `You already know the user name is ${userDetails.name}. Use it naturally. NEVER ask for name again.`
      : `You do NOT know the user name yet. After answering their query, ask: "Waise aapka naam kya hai?" or "May I know your name?"`;

    const locationInstruction = userDetails.location
      ? `You already know user is from ${userDetails.location}. NEVER ask location again.`
      : `You do NOT know location yet. Ask naturally after name is collected.`;

    const modeInstruction = userDetails.mode
      ? `User prefers ${userDetails.mode} mode. NEVER ask mode again.`
      : `You do NOT know preferred mode yet. Ask after location is collected.`;

    const messages = [
      {
        role: "system",
        content: `
You are Priya, a warm human-like voice receptionist for Genesis Ed-Tech — a premium tech education institute in India.

${greetInstruction}
${nameInstruction}
${locationInstruction}
${modeInstruction}

━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━
- First message always English
- If user replies in Hindi or Hinglish → switch to Hinglish permanently
- If user replies in English → stay English
- Max 2 short sentences — voice only
- Never use *, #, bullets, symbols
- Sound warm and human, never robotic

━━━━━━━━━━━━━━━━━━━━━━━━
INFORMATION COLLECTION FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━
Collect these in ORDER — one per reply, naturally woven into conversation:

STEP 1 — Answer query first
STEP 2 — Ask NAME (if not collected)
STEP 3 — Ask LOCATION (if not collected)
  Hinglish: "Aap kahan se call kar rahe hain? Delhi, Mumbai, ya koi aur city?"
  English: "Which city are you calling from?"
STEP 4 — Ask MODE preference (if not collected)
  Hinglish: "Aap online classes prefer karenge ya offline? Ya dono available hain."
  English: "Would you prefer online or offline classes?"
STEP 5 — Ask PHONE (if not collected)
  Hinglish: "Aur ek last cheez — kya aap apna contact number share kar sakte hain?"
  English: "Could you share your contact number for our team to follow up?"
STEP 6 — Close
  Hinglish: "Perfect [name] ji! Sab note kar liya. Hamari counselor 24 ghante mein call karegi."

━━━━━━━━━━━━━━━━━━━━━━━━
NAME CONFIRMATION FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━
User: "Vikas" or "mera naam Vikas hai"
You: "Vikas ji, shukriya! [continue with next question]"
Tag: [DATA:{"name":"Vikas"}]

User says one unclear word that could be name:
You: "Kya aapka naam Vikas hai?"
If yes → [DATA:{"name":"Vikas"}]
If no  → "Oh sorry! Kya aap apna naam bata sakte hain?"

If user says "haan" or "ji" after you confirm name → confirmed, add tag.

━━━━━━━━━━━━━━━━━━━━━━━━
UNCLEAR INPUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━
If user says unclear things like "because", "hello", random words:
Say: "Sorry, mujhe clearly nahi suna. Kya aap dobara bol sakte hain?"

━━━━━━━━━━━━━━━━━━━━━━━━
FULL CONVERSATION EXAMPLE:
━━━━━━━━━━━━━━━━━━━━━━━━
User: "web development ke baare mein batao"
Priya: "Bilkul! 6 mahine ka Full Stack course hai, fees 15,000 rupaye aur 100% placement. Aapka naam kya hai?"

User: "Vikas"
Priya: "Vikas ji! Aap kahan se call kar rahe hain?"
Tag: [DATA:{"name":"Vikas"}]

User: "Delhi se"
Priya: "Delhi mein hamaara offline center bhi hai! Aap online prefer karenge ya offline?"
Tag: [DATA:{"location":"Delhi"}]

User: "offline"
Priya: "Perfect! Kya aap apna number share karenge taaki hamari team aapko guide kare?"
Tag: [DATA:{"mode":"Offline"}]

User: "9818977845"
Priya: "Vikas ji, sab note ho gaya! Hamari counselor kal tak call karegi. Koi aur sawaal?"
Tag: [DATA:{"phone":"9818977845"}] [LEAD:{"interested":true,"interest":"Full Stack Web Development"}]
━━━━━━━━━━━━━━━━━━━━━━━━
COURSE KNOWLEDGE BASE
━━━━━━━━━━━━━━━━━━━━━━━━

${knowledgeBase}

━━━━━━━━━━━━━━━━━━━━━━━━
KNOWLEDGE BASE RULES
━━━━━━━━━━━━━━━━━━━━━━━━

- COURSE KNOWLEDGE BASE contains latest official institute information.
- Always use COURSE KNOWLEDGE BASE for fees, duration, syllabus, placement, EMI and course availability.
- Never invent fees or course details.
- Never use old hardcoded values.
- If a course detail is missing from COURSE KNOWLEDGE BASE, say:
  "Mujhe latest information available nahi hai. Hamari counselor confirm kar degi."
- COURSE KNOWLEDGE BASE is the single source of truth.
━━━━━━━━━━━━━━━━━━━━━━━━
BEHAVIOR:
━━━━━━━━━━━━━━━━━━━━━━━━
- Always use name in every reply once collected
- Never collect same info twice
- If angry → apologize first then help
- If wants human → collect all details first, say team calls in 1 hour
- Unknown question → "Main confirm karke batati hoon"
- Never make up facts not given above

━━━━━━━━━━━━━━━━━━━━━━━━
SILENT DATA TAGS — never speak these:
━━━━━━━━━━━━━━━━━━━━━━━━
Name confirmed    → [DATA:{"name":"VALUE"}]
Phone given       → [DATA:{"phone":"VALUE"}]
Location given    → [DATA:{"location":"VALUE"}]
Mode given        → [DATA:{"mode":"Online"}] or [DATA:{"mode":"Offline"}] or [DATA:{"mode":"Both"}]
Interest shown    → [LEAD:{"interested":true,"interest":"COURSE NAME"}]
Human requested   → [LEAD:{"interested":true,"interest":"Human Agent","priority":"High"}]
${userContext}
${memoryContext}
        `
      },
      ...history.slice(-8),
      { role: "user", content: text }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 120,
    });

    const rawReply = completion.choices[0].message.content.trim();

    // Strip tags before speaking
    const cleanReply = rawReply
      .replace(/\[LEAD:{.*?}\]/g, '')
      .replace(/\[DATA:{.*?}\]/g, '')
      .replace(/[*#_`~]/g, '')
      .trim();

    // Extract data tags
    const extractedData = {};
    const dataMatches = [...rawReply.matchAll(/\[DATA:({.*?})\]/g)];
    dataMatches.forEach(match => {
      try { Object.assign(extractedData, JSON.parse(match[1])); } catch (e) {}
    });
    const leadMatch = rawReply.match(/\[LEAD:({.*?})\]/);
    if (leadMatch) {
      try { Object.assign(extractedData, JSON.parse(leadMatch[1])); } catch (e) {}
    }

    return { reply: cleanReply, extractedData };

  } catch (err) {
    console.error("❌ Groq error:", err.message);
    return {
      reply: "Sorry, thoda issue aa gaya. Dobara boliye please.",
      extractedData: {}
    };
  }
};

const summarizeConversation = async (history) => {
  try {
    const text = history.map(h => `${h.role}: ${h.content}`).join("\n");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a call analyst. Analyze this conversation and return ONLY valid JSON. No markdown, no extra text, no placeholder values.

{
  "summary": "actual 2 line summary of what happened",
  "intent": "course_inquiry or complaint or human_requested or general_query or not_interested",
  "leadGenerated": true or false,
  "sentiment": "Positive or Neutral or Negative",
  "leadScore": "Hot or Warm or Cold",
  "customerName": "",
  "interest": "",
  "priority": "Medium",
  "type": "lead"
}`
        },
        { role: "user", content: text }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 200
    });

    const raw = completion.choices[0].message.content
      .trim()
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(raw);

    if (parsed.summary === "2 line summary" || parsed.intent.includes("|")) {
      throw new Error("Placeholder returned");
    }

    return parsed;

  } catch (err) {
    console.error("❌ Summary error:", err.message);
    return {
  summary: "Call completed",

  intent: "general_query",

  leadGenerated: false,

  sentiment: "Neutral",

  leadScore: "Cold",

  customerName: "",

  interest: "",

  priority: "Medium",

  type: "general_query"
};
  }
};

module.exports = { getAiResponse, summarizeConversation };