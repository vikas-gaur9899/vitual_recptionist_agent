const express = require("express");

const router = express.Router();

const { getActivities } =
    require("../controllers/activity.controller");

const { protect } = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/role.middleware");

router.get(
    "/",
    protect,
    allowRoles("admin", "super_admin"),
    getActivities
);

module.exports = router;