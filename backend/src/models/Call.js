const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema({

    /**
     * Twilio Call SID
     */
    callSid: {
        type: String,
        required: true,
        unique: true
    },

    /**
     * Customer Number
     */
    from: {
        type: String
    },

    /**
     * Business Number
     */
    to: {
        type: String
    },

    /**
     * Call Direction
     */
    direction: {
        type: String,
        enum: [
            "inbound",
            "outbound-api"
        ],
        default: "inbound"
    },

    /**
     * Current Call Status
     */
    status: {
        type: String,
        default: "ringing"
    },

    /**
     * Full Conversation Transcript
     */
    transcript: [{
        role: {
            type: String,
            enum: [
                "user",
                "assistant"
            ]
        },

        text: {
            type: String
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    /**
     * Call Duration (seconds)
     */
    duration: {
        type: Number
    },

    /**
     * Customer Sentiment
     */
    sentiment: {
        type: String,
        default: "Neutral"
    },

    /**
     * AI Generated Summary
     */
    summary: {
        type: String
    },

    /**
     * AI Detected Intent
     */
    intent: {
        type: String
    },

    /**
     * Lead Generated?
     */
    leadGenerated: {
        type: Boolean,
        default: false
    },

    /**
     * Linked Lead
     */
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead"
    },

    /**
     * Executive Who Handled
     */
    executiveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    /**
     * CRM Call Type
     */
    callType: {
        type: String,

        enum: [
            "lead",
            "complaint",
            "support",
            "general_query",
            "campaign"
        ],

        default: "lead"
    },

    /**
     * Recording URL
     * Twilio Recording
     */
    recordingUrl: {
        type: String
    },

    /**
     * Follow-up Required
     */
    followUpRequired: {
        type: Boolean,
        default: false
    },

    /**
     * Follow-up Date
     */
    followUpDate: {
        type: Date
    },

    /**
     * Executive Notes
     */
    notes: {
        type: String
    },

    /**
     * Call Outcome
     */
    outcome: {
        type: String,

        enum: [

            "converted",

            "interested",

            "follow_up",

            "not_interested",

            "resolved",

            "escalated",

            "pending"

        ]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Call",
    CallSchema
);