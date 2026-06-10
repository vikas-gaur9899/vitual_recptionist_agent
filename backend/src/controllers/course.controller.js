const Course =
require("../models/Course");

const asyncHandler =
require("../utils/asyncHandler");

const ApiResponse =
require("../utils/ApiResponse");

const ApiError =
require("../utils/ApiError");

/**
 * Create Course
 */

const createCourse =
asyncHandler(async (

    req,
    res

) => {

    const course =
    await Course.create(

        req.body
    );

    return res.status(201).json(

        new ApiResponse(

            201,

            course,

            "Course created successfully"
        )
    );
});

/**
 * Get Courses
 */

const getCourses =
asyncHandler(async (

    req,
    res

) => {

    const courses =
    await Course.find()

    .sort({
        createdAt: -1
    });

    return res.status(200).json(

        new ApiResponse(

            200,

            courses
        )
    );
});

/**
 * Update Course
 */

const updateCourse =
asyncHandler(async (

    req,
    res

) => {

    const course =
    await Course.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
            new: true
        }
    );

    if (!course) {

        throw new ApiError(
            404,
            "Course not found"
        );
    }

    return res.status(200).json(

        new ApiResponse(

            200,

            course,

            "Course updated"
        )
    );
});

/**
 * Delete Course
 */

const deleteCourse =
asyncHandler(async (

    req,
    res

) => {

    const course =
    await Course.findByIdAndDelete(

        req.params.id
    );

    if (!course) {

        throw new ApiError(
            404,
            "Course not found"
        );
    }

    return res.status(200).json(

        new ApiResponse(

            200,

            null,

            "Course deleted"
        )
    );
});

module.exports = {

    createCourse,

    getCourses,

    updateCourse,

    deleteCourse
};