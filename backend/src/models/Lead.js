const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  name: { type: String, default: "Prospect" },
  interest: { type: String }, // e.g., "MERN Stack Course"
  summary: { type: String },  // AI will write a summary of the talk
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified'], default: 'New' },
  sourceCall: { type: String } // Stores the CallSid
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);