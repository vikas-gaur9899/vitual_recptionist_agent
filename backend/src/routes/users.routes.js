const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// ── Create Admin (Super Admin only)
router.post("/admin",     protect, allowRoles("super_admin"),         createAdmin);

// ── Create Executive (Admin + Super Admin)
router.post("/executive", protect, allowRoles("admin", "super_admin"), createExecutive);

// ── Get All Users
router.get("/",           protect, allowRoles("admin", "super_admin"), getUsers);

// ── Leaderboard
router.get("/leaderboard", protect, allowRoles("admin", "super_admin"), getLeaderboard);

// ── Executive Performance
router.get("/executive-performance/:id", protect, allowRoles("admin", "super_admin"), getExecutivePerformance);

// ── Enable / Disable / Delete
router.put("/:id/enable",  protect, allowRoles("admin", "super_admin"), enableUser);
router.put("/:id/disable", protect, allowRoles("admin", "super_admin"), disableUser);
router.delete("/:id",      protect, allowRoles("admin", "super_admin"), deleteUser);

// ── Update User Details (admin kisi ka bhi)
router.put("/:id/update",  protect, allowRoles("admin", "super_admin"), updateUser);

// ── Reset User Password (admin kisi ka bhi)
router.put("/:id/reset-password", protect, allowRoles("admin", "super_admin"), resetUserPassword);

// ── Own Password + Profile
router.put("/change-password", protect, changePassword);
router.put("/profile",         protect, updateProfile);

module.exports = router;