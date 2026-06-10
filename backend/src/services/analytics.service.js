const Lead =
require("../models/Lead");

const Call =
require("../models/Call");

const User =
require("../models/User");

/**
 * Dashboard Analytics
 */

const getDashboardAnalytics =
async () => {

    const [
        totalLeads,
        totalCalls,
        totalExecutives
    ] = await Promise.all([

        Lead.countDocuments(),

        Call.countDocuments(),

        User.countDocuments({
            role: "executive"
        })
    ]);

    const convertedLeads =
        await Lead.countDocuments({

            status:
                "Converted"
        });

    const conversionRate =
        totalLeads
            ?
            (
                (
                    convertedLeads
                    /
                    totalLeads
                )
                * 100
            ).toFixed(2)
            :
            0;

    return {

        totalLeads,

        totalCalls,

        totalExecutives,

        convertedLeads,

        conversionRate
    };
};

module.exports = {
    getDashboardAnalytics
};