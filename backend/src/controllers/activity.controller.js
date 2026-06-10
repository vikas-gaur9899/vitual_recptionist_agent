const ActivityLog =
require("../models/ActivityLog");

const ApiResponse =
require("../utils/ApiResponse");

const asyncHandler =
require("../utils/asyncHandler");

/**
 * Get Activity Logs
 */

const getActivities =
asyncHandler(async (
    req,
    res
) => {

    const page =
        Number(req.query.page)
        || 1;

    const limit =
        Number(req.query.limit)
        || 20;

    const skip =
        (page - 1)
        * limit;

    const logs =
        await ActivityLog.find()

        .sort({
            createdAt: -1
        })

        .skip(skip)

        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            logs
        )
    );
});

module.exports = {
    getActivities
};