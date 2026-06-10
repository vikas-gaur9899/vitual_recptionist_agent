const mongoose = require("mongoose");

/**
 * User Settings
 */

const settingsSchema =
new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    phone: String,

    avatar: String,

    theme: {
        type: String,
        default: "light"
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Settings",
    settingsSchema
);