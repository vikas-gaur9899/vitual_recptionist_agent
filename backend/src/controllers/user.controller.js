const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Lead = require("../models/Lead");
const Call = require("../models/Call");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activity.service");

/**
 * Super Admin Creates Admin
 */
const createAdmin = asyncHandler(async (req, res) => {

    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(400, "Admin already exists");

    const admin = await User.create({
        name, email, password, phone,
        role: "admin",
        createdBy: req.user._id
    });

    await logActivity({
        user: req.user,
        action: "CREATE_ADMIN",
        entityType: "user",
        entityId: admin._id,
        details: { adminName: admin.name, email: admin.email }
    });

    return res.status(201).json(
        new ApiResponse(201, admin, "Admin created successfully")
    );
});

/**
 * Admin Creates Executive
 */
const createExecutive = asyncHandler(async (req, res) => {

    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(400, "Executive already exists");

    const executive = await User.create({
        name, email, password, phone,
        role: "executive",
        managedBy: req.user._id,
        availabilityStatus: "available"
    });

    await logActivity({
        user: req.user,
        action: "CREATE_EXECUTIVE",
        entityType: "user",
        entityId: executive._id,
        details: { executiveName: executive.name }
    });

    return res.status(201).json(
        new ApiResponse(201, executive, "Executive created successfully")
    );
});

/**
 * List Users
 */
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    return res.status(200).json(new ApiResponse(200, users));
});

/**
 * Update User Details
 * Super Admin/Admin kisi bhi user ki details update kar sakta hai
 */
const updateUser = asyncHandler(async (req, res) => {

    const { name, email, phone } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    // Email change ho raha hai toh duplicate check karo
    if (email && email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists) throw new ApiError(400, "Email already in use");
    }

    const updated = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, phone },
        { new: true }
    ).select("-password");

    await logActivity({
        user: req.user,
        action: "UPDATE_USER",
        entityType: "user",
        entityId: updated._id,
        details: { updatedUser: updated.name, role: updated.role }
    });

    return res.status(200).json(
        new ApiResponse(200, updated, "User updated successfully")
    );
});

/**
 * Reset User Password
 * Super Admin/Admin kisi bhi user ka password set kar sakta hai
 */
const resetUserPassword = asyncHandler(async (req, res) => {

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.password = newPassword; // pre-save hook hash karega
    await user.save();

    await logActivity({
        user: req.user,
        action: "RESET_PASSWORD",
        entityType: "user",
        entityId: user._id,
        details: { resetFor: user.name, role: user.role }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    );
});

/**
 * Disable User
 */
const disableUser = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!user) throw new ApiError(404, "User not found");

    await logActivity({
        user: req.user,
        action: "DISABLE_USER",
        entityType: "user",
        entityId: user._id,
        details: { disabledUser: user.name }
    });

    return res.status(200).json(new ApiResponse(200, user, "User disabled"));
});

/**
 * Enable User
 */
const enableUser = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
    );

    if (!user) throw new ApiError(404, "User not found");

    await logActivity({
        user: req.user,
        action: "ENABLE_USER",
        entityType: "user",
        entityId: user._id,
        details: { enabledUser: user.name }
    });

    return res.status(200).json(
        new ApiResponse(200, user, "User enabled successfully")
    );
});

/**
 * Delete User
 */
const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
        user: req.user,
        action: "DELETE_USER",
        entityType: "user",
        entityId: user._id,
        details: { deletedUser: user.name }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

/**
 * Change Own Password
 */
const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

/**
 * Update Own Profile
 */
const updateProfile = asyncHandler(async (req, res) => {

    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

/**
 * Executive Performance
 */
const getExecutivePerformance = asyncHandler(async (req, res) => {

    const executiveId = req.params.id;

    const [totalLeads, converted, followUps, complaints, callsHandled] =
        await Promise.all([
            Lead.countDocuments({ assignedTo: executiveId }),
            Lead.countDocuments({ assignedTo: executiveId, status: "Converted" }),
            Lead.countDocuments({ assignedTo: executiveId, status: "Follow-up" }),
            Lead.countDocuments({ assignedTo: executiveId, type: "complaint" }),
            Call.countDocuments({ executiveId })
        ]);

    return res.status(200).json(
        new ApiResponse(200, {
            totalLeads, converted, followUps, complaints, callsHandled
        }, "Executive performance fetched")
    );
});

/**
 * Executive Leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {

    const executives = await User.find({
        role: "executive",
        isActive: true
    }).select("name email phone availabilityStatus");

    const leaderboardData = await Promise.all(
        executives.map(async (executive) => {

            const [totalLeads, converted, followUps, complaints, callsHandled] =
                await Promise.all([
                    Lead.countDocuments({ assignedTo: executive._id }),
                    Lead.countDocuments({ assignedTo: executive._id, status: "Converted" }),
                    Lead.countDocuments({ assignedTo: executive._id, status: "Follow-up" }),
                    Lead.countDocuments({ assignedTo: executive._id, type: "complaint" }),
                    Call.countDocuments({ executiveId: executive._id })
                ]);

            const conversionRate = totalLeads > 0
                ? Math.round((converted / totalLeads) * 100) : 0;

            const score =
                (converted * 10) +
                (callsHandled * 2) +
                (conversionRate * 3) -
                (complaints * 5);

            return {
                _id: executive._id,
                name: executive.name,
                email: executive.email,
                phone: executive.phone,
                availabilityStatus: executive.availabilityStatus,
                totalLeads, converted, followUps,
                complaints, callsHandled,
                conversionRate,
                score: Math.max(0, score)
            };
        })
    );

    const sorted = leaderboardData.sort((a, b) => b.score - a.score);

    return res.status(200).json(
        new ApiResponse(200, sorted, "Leaderboard fetched successfully")
    );
});

module.exports = {
    createAdmin,
    createExecutive,
    getUsers,
    updateUser,
    resetUserPassword,
    disableUser,
    enableUser,
    deleteUser,
    changePassword,
    updateProfile,
    getExecutivePerformance,
    getLeaderboard
};