const User = require("../models/User");
const Lead = require("../models/Lead");
const Call = require("../models/Call");

const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Dashboard Analytics
 */

const getDashboardAnalytics = asyncHandler(
    async (req, res) => {

        const role = req.user.role;

        let analytics = {};

        /**
         * SUPER ADMIN
         */
        if (role === "super_admin") {

            const [

                totalCalls,

                totalLeads,

                totalAdmins,

                totalExecutives,

                convertedLeads,

                complaints

            ] = await Promise.all([

                Call.countDocuments(),

                Lead.countDocuments(),

                User.countDocuments({
                    role: "admin"
                }),

                User.countDocuments({
                    role: "executive"
                }),

                Lead.countDocuments({
                    status: "Converted"
                }),

                Lead.countDocuments({
                    type: "complaint"
                })
            ]);

            analytics = {

                totalCalls,

                totalLeads,

                totalAdmins,

                totalExecutives,

                convertedLeads,

                complaints,

                conversionRate:

                    totalLeads > 0

                        ? (
                            (
                                convertedLeads /
                                totalLeads
                            ) * 100
                        ).toFixed(2)

                        : 0
            };
        }

        /**
         * ADMIN DASHBOARD
         */
        else if (role === "admin") {

            const executives =
                await User.find({

                    role: "executive",

                    managedBy:
                        req.user._id
                })

                .select("_id");

            const executiveIds =
                executives.map(
                    e => e._id
                );

            const [

                assignedLeads,

                convertedLeads,

                followUps,

                complaints

            ] = await Promise.all([

                Lead.countDocuments({

                    assignedTo: {
                        $in:
                        executiveIds
                    }
                }),

                Lead.countDocuments({

                    assignedTo: {
                        $in:
                        executiveIds
                    },

                    status:
                    "Converted"
                }),

                Lead.countDocuments({

                    assignedTo: {
                        $in:
                        executiveIds
                    },

                    status:
                    "Follow-up"
                }),

                Lead.countDocuments({

                    assignedTo: {
                        $in:
                        executiveIds
                    },

                    type:
                    "complaint"
                })
            ]);

            analytics = {

                assignedLeads,

                convertedLeads,

                followUps,

                complaints,

                totalExecutives:
                    executiveIds.length
            };
        }

        /**
         * EXECUTIVE DASHBOARD
         */
        else {

            const [

                myLeads,

                converted,

                followUps,

                complaints,

                callsHandled

            ] = await Promise.all([

                Lead.countDocuments({

                    assignedTo:
                    req.user._id
                }),

                Lead.countDocuments({

                    assignedTo:
                    req.user._id,

                    status:
                    "Converted"
                }),

                Lead.countDocuments({

                    assignedTo:
                    req.user._id,

                    status:
                    "Follow-up"
                }),

                Lead.countDocuments({

                    assignedTo:
                    req.user._id,

                    type:
                    "complaint"
                }),

                Call.countDocuments({

                    executiveId:
                    req.user._id
                })
            ]);

            analytics = {

                myLeads,

                converted,

                followUps,

                complaints,

                callsHandled
            };
        }

        return res.status(200).json(

            new ApiResponse(

                200,

                analytics,

                "Dashboard analytics fetched"
            )
        );
    }
);

/**
 * Executive Performance
 */

const getExecutivePerformance =
asyncHandler(async (

    req,

    res

) => {

    const executiveId =
        req.params.id;

    const [

        totalLeads,

        converted,

        followUps,

        complaints,

        callsHandled

    ] = await Promise.all([

        Lead.countDocuments({

            assignedTo:
            executiveId
        }),

        Lead.countDocuments({

            assignedTo:
            executiveId,

            status:
            "Converted"
        }),

        Lead.countDocuments({

            assignedTo:
            executiveId,

            status:
            "Follow-up"
        }),

        Lead.countDocuments({

            assignedTo:
            executiveId,

            type:
            "complaint"
        }),

        Call.countDocuments({

            executiveId
        })
    ]);

    return res.status(200).json(

        new ApiResponse(

            200,

            {

                totalLeads,

                converted,

                followUps,

                complaints,

                callsHandled
            },

            "Executive performance fetched"
        )
    );
});

/**
 * Monthly Lead Trend
 */

const getLeadTrends =
asyncHandler(async (

    req,

    res

) => {

    const trends =
        await Lead.aggregate([

            {
                $group: {

                    _id: {

                        month: {
                            $month:
                            "$createdAt"
                        },

                        year: {
                            $year:
                            "$createdAt"
                        }
                    },

                    total: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

    return res.status(200).json(

        new ApiResponse(

            200,

            trends,

            "Lead trends fetched"
        )
    );
});

module.exports = {

    getDashboardAnalytics,

    getExecutivePerformance,

    getLeadTrends
};