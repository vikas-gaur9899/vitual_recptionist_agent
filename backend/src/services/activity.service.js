const ActivityLog = require("../models/ActivityLog");

/**
 * Centralized Activity Logger
 *
 * Har important action
 * yahi se log hoga.
 */

const logActivity = async ({
    user,
    action,
    entityType,
    entityId,

    customerName,
    customerPhone,

    oldStatus,
    newStatus,

    summary,

    details = {}
}) => {

    try {

        await ActivityLog.create({

            userId: user?._id,

            userName:
                user?.name || "SYSTEM",

            userRole:
                user?.role || "system",

            action,

            entityType,

            entityId,

            customerName,

            customerPhone,

            oldStatus,

            newStatus,

            summary,

            details

        });

    } catch (error) {

        console.error(
            "Activity Log Error:",
            error.message
        );
    }
};

module.exports = {
    logActivity
};