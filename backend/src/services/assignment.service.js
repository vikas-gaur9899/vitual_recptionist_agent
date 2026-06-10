const User = require("../models/User");
const Lead = require("../models/Lead");

/**
 * Smart Lead Assignment Engine
 *
 * Current Strategy:
 * Least Active Workload
 */

const assignLeadAutomatically =
async () => {

    const executives =
        await User.find({

            role: "executive",

            isActive: true,

            availabilityStatus:
                "available"

        });

    if (!executives.length) {
        return null;
    }

    let selectedExecutive =
        null;

    let lowestLoad =
        Number.MAX_SAFE_INTEGER;

    for (
        const executive
        of executives
    ) {

        const activeLeads =
            await Lead.countDocuments({

                assignedTo:
                    executive._id,

                status: {
                    $in: [
                        "New",
                        "Assigned",
                        "Interested",
                        "Follow-up",
                        "In Progress",
                        "Open"
                    ]
                }
            });

        if (
            activeLeads
            <
            lowestLoad
        ) {

            lowestLoad =
                activeLeads;

            selectedExecutive =
                executive;
        }
    }

    return selectedExecutive;
};

module.exports = {
    assignLeadAutomatically
};