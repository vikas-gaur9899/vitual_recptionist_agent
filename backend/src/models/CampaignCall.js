const mongoose = require("mongoose");

/**
 * Every outbound call
 * belongs to a campaign.
 */

const campaignCallSchema =
new mongoose.Schema({

    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true
    },

    customerName: String,

    phoneNumber: String,

    status: {
        type: String,
        enum: [
            "pending",
            "answered",
            "interested",
            "converted",
            "failed"
        ],
        default: "pending"
    },

    callSid: String,

    notes: String

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "CampaignCall",
    campaignCallSchema
);