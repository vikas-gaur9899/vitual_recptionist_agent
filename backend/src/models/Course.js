const mongoose =
require("mongoose");

const courseSchema =
new mongoose.Schema(

    {

        name: {

            type: String,

            required: true,

            trim: true
        },

        duration: {

            type: String,

            required: true
        },

        fees: {

            type: Number,

            required: true
        },

        emi: {

            type: String,

            default: ""
        },

        syllabus: {

            type: String,

            default: ""
        },

        projects: {

            type: String,

            default: ""
        },

        placement: {

            type: String,

            default: ""
        },

        isActive: {

            type: Boolean,

            default: true
        }

    },

    {

        timestamps: true
    }
);

module.exports =
mongoose.model(
    "Course",
    courseSchema
);