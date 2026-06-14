require('dotenv').config();
const express    = require('express'); 
const mongoose   = require('mongoose');
const http       = require('http');
const { WebSocketServer } = require('ws');
const twilio     = require('twilio');

const usersRoutes     = require("./routes/users.routes");
const courseRoutes    = require("./routes/course.routes");
const activityRoutes  = require("./routes/activity.routes");
const campaignRoutes  = require("./routes/campaign.routes");
const settingsRoutes  = require("./routes/settings.routes");
const twilioRoutes    = require('./routes/twilio.routes');
const authRoutes      = require('./routes/auth.routes');
const leadsRoutes     = require('./routes/leads.routes');
const callsRoutes     = require('./routes/calls.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const handleMediaStream = require('./services/stream.handler');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const app    = express();

// ── CORS — hardcoded, no package needed ──
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Sab Vercel URLs + localhost allow
  const allowed =
    !origin ||
    origin.includes("vercel.app") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1");

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Routes
app.use("/api/users",     usersRoutes);
app.use("/api/activity",  activityRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/courses",   courseRoutes);
app.use("/api/settings",  settingsRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadsRoutes);
app.use('/api/calls',     callsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/voice',         twilioRoutes);

// ── Outbound call
app.get('/call-me', async (req, res) => {
  try {
    const call = await client.calls.create({
      to:   "+919818977845",
      from: process.env.TWILIO_PHONE_NUMBER,
      url:  `https://${process.env.AI_SERVICE_DOMAIN}/voice/inbound`,
      statusCallback:       `https://${process.env.AI_SERVICE_DOMAIN}/voice/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent:  ['completed', 'failed']
    });
    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health
app.get('/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString()
}));

// ── MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => { console.error("❌ DB Failed:", err.message); process.exit(1); });

// ── Server + WebSocket
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/media-stream' });
wss.on('connection', (ws) => handleMediaStream(ws));

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});