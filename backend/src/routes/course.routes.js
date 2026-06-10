const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/role.middleware");

const { createCourse, getCourses, updateCourse, deleteCourse } =
    require("../controllers/course.controller");

router.get(
    "/",
    protect,
    allowRoles("admin", "super_admin"),
    getCourses
);

router.post(
    "/",
    protect,
    allowRoles("admin", "super_admin"),
    createCourse
);

router.put(
    "/:id",
    protect,
    allowRoles("admin", "super_admin"),
    updateCourse
);

router.delete(
    "/:id",
    protect,
    allowRoles("admin", "super_admin"),
    deleteCourse
);

module.exports = router;