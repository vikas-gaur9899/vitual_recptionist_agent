const Campaign = require("../models/Campaign");
const CampaignCall = require("../models/CampaignCall");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const {
    createCampaign
} = require("../services/campaign.service");

/**
 * Create Campaign
 */
const createNewCampaign = asyncHandler(async (req, res) => {

    const campaign = await createCampaign({
        name: req.body.name,
        uploadedBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            campaign,
            "Campaign created successfully"
        )
    );
});

/**
 * Get All Campaigns
 */
const getCampaigns = asyncHandler(async (req, res) => {

    const campaigns = await Campaign.find()
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            campaigns,
            "Campaigns fetched successfully"
        )
    );
});

/**
 * Get Single Campaign
 */
const getCampaignById = asyncHandler(async (req, res) => {

    const campaign = await Campaign.findById(
        req.params.id
    );

    if (!campaign) {
        throw new ApiError(
            404,
            "Campaign not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            campaign,
            "Campaign fetched successfully"
        )
    );
});

/**
 * Start Campaign
 */
const startCampaign = asyncHandler(async (req, res) => {

    const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        {
            status: "running",
            startedAt: new Date()
        },
        {
            new: true
        }
    );

    if (!campaign) {
        throw new ApiError(
            404,
            "Campaign not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            campaign,
            "Campaign started successfully"
        )
    );
});

/**
 * Stop Campaign
 */
const stopCampaign = asyncHandler(async (req, res) => {

    const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        {
            status: "stopped",
            stoppedAt: new Date()
        },
        {
            new: true
        }
    );

    if (!campaign) {
        throw new ApiError(
            404,
            "Campaign not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            campaign,
            "Campaign stopped successfully"
        )
    );
});

/**
 * Campaign Analytics
 */
const getCampaignAnalytics = asyncHandler(async (req, res) => {

    const campaignId = req.params.id;

    const totalCalls = await CampaignCall.countDocuments({
        campaignId
    });

    const connectedCalls = await CampaignCall.countDocuments({
        campaignId,
        status: "connected"
    });

    const leadsGenerated = await CampaignCall.countDocuments({
        campaignId,
        leadGenerated: true
    });

    const notAnswered = await CampaignCall.countDocuments({
        campaignId,
        status: "no-answer"
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalCalls,
                connectedCalls,
                leadsGenerated,
                notAnswered
            },
            "Campaign analytics fetched successfully"
        )
    );
});

module.exports = {
    createNewCampaign,
    getCampaigns,
    getCampaignById,
    startCampaign,
    stopCampaign,
    getCampaignAnalytics
};