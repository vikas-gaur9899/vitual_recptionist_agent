const express = require("express");

const router = express.Router();

const {
    getSettings,
    updateSettings,
    changePassword,
    updateProfile
} = require("../controllers/settings.controller");

const { protect } = require("../middleware/auth.middleware");

/**
 * SETTINGS
 */

router.get("/", protect, getSettings);

router.put("/", protect, updateSettings);

/**
 * CHANGE PASSWORD
 */

router.put(
    "/change-password",
    protect,
    changePassword
);

/**
 * UPDATE PROFILE
 */

router.put(
    "/profile",
    protect,
    updateProfile
);

module.exports = router;