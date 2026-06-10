const express = require("express");

const router = express.Router();

const {
    createNewCampaign,
    getCampaigns,
    getCampaignById,
    startCampaign,
    stopCampaign,
    getCampaignAnalytics
} = require("../controllers/campaign.controller");

const { protect } = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/role.middleware");

/**
 * CREATE CAMPAIGN
 */

router.post(
    "/",
    protect,
    allowRoles("admin", "super_admin"),
    createNewCampaign
);

/**
 * GET ALL CAMPAIGNS
 */

router.get(
    "/",
    protect,
    allowRoles("admin", "super_admin"),
    getCampaigns
);

/**
 * GET SINGLE CAMPAIGN
 */

router.get(
    "/:id",
    protect,
    allowRoles("admin", "super_admin"),
    getCampaignById
);

/**
 * START CAMPAIGN
 */

router.post(
    "/start/:id",
    protect,
    allowRoles("admin", "super_admin"),
    startCampaign
);

/**
 * STOP CAMPAIGN
 */

router.post(
    "/stop/:id",
    protect,
    allowRoles("admin", "super_admin"),
    stopCampaign
);

/**
 * CAMPAIGN ANALYTICS
 */

router.get(
    "/analytics/:id",
    protect,
    allowRoles("admin", "super_admin"),
    getCampaignAnalytics
);

module.exports = router;