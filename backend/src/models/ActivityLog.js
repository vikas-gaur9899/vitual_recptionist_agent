const mongoose = require("mongoose");

/**
 * Enterprise Audit Trail
 *
 * Every critical action
 * in the system will be recorded.
 */

const activityLogSchema =
new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    userName: {
        type: String,
        required: true
    },

    userRole: {
        type: String,
        enum: [
            "super_admin",
            "admin",
            "executive",
            "system"
        ],
        required: true
    },

    action: {
        type: String,
        required: true
    },

    entityType: {
        type: String,
        enum: [
            "user",
            "lead",
            "call",
            "campaign",
            "complaint",
            "system"
        ]
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },

    customerName: String,

    customerPhone: String,

    oldStatus: String,

    newStatus: String,

    summary: String,

    details: {
        type: Object,
        default: {}
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "ActivityLog",
    activityLogSchema
);