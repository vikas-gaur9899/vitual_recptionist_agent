require('dotenv').config();
console.log("JWT:", process.env.JWT_SECRET);
const express    = require('express'); 
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const { WebSocketServer } = require('ws');
const twilio     = require('twilio');

// Routes
const usersRoutes = require("./routes/users.routes");
const courseRoutes = require("./routes/course.routes");

const activityRoutes = require("./routes/activity.routes");

const campaignRoutes = require("./routes/campaign.routes");

const settingsRoutes = require("./routes/settings.routes");
const twilioRoutes    = require('./routes/twilio.routes');
const authRoutes      = require('./routes/auth.routes');
const leadsRoutes     = require('./routes/leads.routes');
const callsRoutes     = require('./routes/calls.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Services
const handleMediaStream = require('./services/stream.handler');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const app    = express();

// ── Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── API Routes
app.use(
    "/api/users",
    usersRoutes
);

app.use(
    "/api/activity",
    activityRoutes
);

app.use(
    "/api/campaigns",
    campaignRoutes
);
app.use(
    "/api/courses",
    courseRoutes
);
app.use(
    "/api/settings",
    settingsRoutes
);
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadsRoutes);
app.use('/api/calls',     callsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/voice',         twilioRoutes);

// ── Trigger outbound call
app.get('/call-me', async (req, res) => {
  try {
    const call = await client.calls.create({
      to:   "+919818977845",
      from: process.env.TWILIO_PHONE_NUMBER,
      url:  `https://${process.env.AI_SERVICE_DOMAIN}/voice/inbound`,
      statusCallback:      `https://${process.env.AI_SERVICE_DOMAIN}/voice/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent:  ['completed', 'failed']
    });
    console.log("📞 Call triggered:", call.sid);
    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error("❌ Call Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString()
}));

// ── MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => { console.error("❌ DB Failed:", err.message); process.exit(1); });

mongoose.connection.on('disconnected', () => console.warn("⚠️ MongoDB disconnected"));

// ── HTTP + WebSocket
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/media-stream' });

wss.on('connection', (ws) => {
  console.log("🔗 Media stream connected");
  handleMediaStream(ws);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Domain: https://${process.env.AI_SERVICE_DOMAIN}`);
});