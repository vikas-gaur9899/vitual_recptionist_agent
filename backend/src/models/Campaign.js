const mongoose = require("mongoose");

/**
 * Outbound Campaign
 */

const campaignSchema =
new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    totalContacts: {
        type: Number,
        default: 0
    },

    totalCalled: {
        type: Number,
        default: 0
    },

    totalInterested: {
        type: Number,
        default: 0
    },

    totalConverted: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "draft",
            "running",
            "completed",
            "paused"
        ],
        default: "draft"
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Campaign",
    campaignSchema
);