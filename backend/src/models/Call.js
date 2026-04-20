const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  callSid: { type: String, required: true, unique: true },
  from: { type: String }, // Caller's number (Inbound)
  to: { type: String },   // Recipient's number (Outbound)
  direction: { 
    type: String, 
    enum: ['inbound', 'outbound-api'], 
    default: 'inbound' 
  },
  status: { type: String, default: 'ringing' },
  transcript: [{
    role: { type: String, enum: ['user', 'assistant'] },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  duration: { type: Number },
  sentiment: { type: String, default: 'Neutral' },
  // Link to a lead if one is created during this call
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }
}, { timestamps: true });

module.exports = mongoose.model('Call', CallSchema);