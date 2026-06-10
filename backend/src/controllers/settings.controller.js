const bcrypt = require("bcryptjs");

const Settings = require("../models/Settings");
const User = require("../models/User");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Get User Settings
 * User model se name/phone/avatar + Settings model se theme
 */
const getSettings = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                name:   user.name  || "",
                phone:  user.phone || "",
                avatar: user.avatar || ""
            },
            "Settings fetched successfully"
        )
    );
});

/**
 * Update Settings
 */
const updateSettings = asyncHandler(async (req, res) => {

    const settings = await Settings.findOneAndUpdate(
        { userId: req.user._id },
        req.body,
        { new: true, upsert: true }
    );

    return res.status(200).json(
        new ApiResponse(200, settings, "Settings updated successfully")
    );
});

/**
 * Change Password
 * pre-save hook hash karega — manual hash nahi
 */
const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;   // pre-save hook hash karega
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

/**
 * Update Profile
 */
const updateProfile = asyncHandler(async (req, res) => {

    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

module.exports = {
    getSettings,
    updateSettings,
    changePassword,
    updateProfile
};