const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({

    phoneNumber: { type: String, required: true },
    name:        { type: String, default: "Prospect" },
    interest:    { type: String },
    location:    { type: String },

    mode: {
        type: String,
        enum: ["Online", "Offline", "Both", "Not Specified"],
        default: "Not Specified"
    },

    summary:  { type: String },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium"
    },

    status: {
        type: String,
        enum: [
            // Lead Flow
            "New", "Assigned", "Contacted", "Interested",
            "Follow-up", "Qualified", "Converted",
            "Not Converted", "Not Interested",
            // Complaint Flow
            "Open", "In Progress", "Resolved",
            "Not Resolved", "Escalated",
            // Final
            "Closed"
        ],
        default: "New"
    },

    leadScore: {
        type: String,
        enum: ["Hot", "Warm", "Cold"],
        default: "Cold"
    },

    sentiment:  { type: String, default: "Neutral" },
    sourceCall: { type: String },

    type: {
        type: String,
        enum: ["lead", "complaint", "support", "general_query"],
        default: "lead"
    },

    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt:  { type: Date },

    notes:           { type: String },
    followUpDate:    { type: Date },
    lastUpdatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    complaintCategory: { type: String },
    resolutionSummary: { type: String },

    /**
     * Lead Lifecycle Timeline
     * Har status update yahan record hoga
     */
    timeline: [{
        status:       { type: String },
        summary:      { type: String },
        callDuration: { type: String },
        callTime:     { type: Date },
        updatedBy:    { type: String },
        updatedByRole:{ type: String },
        followUpDate: { type: Date },
        coursePurchased: { type: String },
        queryResolved:   { type: Boolean },
        createdAt:    { type: Date, default: Date.now }
    }]

}, { timestamps: true });

module.exports = mongoose.model("Lead", LeadSchema);