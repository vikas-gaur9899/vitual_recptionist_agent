const mongoose = require("mongoose");

/**
 * Long Term AI Memory
 *
 * Used to remember customers
 * across future calls.
 */

const customerMemorySchema =
new mongoose.Schema({

    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    customerName: String,

    summary: String,

    interest: String,

    lastIntent: String,

    lastSentiment: {
        type: String,
        default: "Neutral"
    },

    totalCalls: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "CustomerMemory",
    customerMemorySchema
);