const Campaign =
require("../models/Campaign");

const CampaignCall =
require("../models/CampaignCall");

/**
 * Campaign Service
 */

const createCampaign =
async ({
    name,
    uploadedBy
}) => {

    return await Campaign.create({

        name,

        uploadedBy
    });
};

const getCampaignStats =
async (
    campaignId
) => {

    const calls =
        await CampaignCall.find({

            campaignId
        });

    const stats = {

        total: calls.length,

        interested: 0,

        converted: 0,

        failed: 0
    };

    calls.forEach(call => {

        if (
            call.status ===
            "interested"
        ) {
            stats.interested++;
        }

        if (
            call.status ===
            "converted"
        ) {
            stats.converted++;
        }

        if (
            call.status ===
            "failed"
        ) {
            stats.failed++;
        }
    });

    return stats;
};

module.exports = {

    createCampaign,

    getCampaignStats
};