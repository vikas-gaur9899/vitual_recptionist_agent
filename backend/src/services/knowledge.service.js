const Course =
require("../models/Course");

const getKnowledgeBase =
async () => {

    const courses =
    await Course.find({

        isActive: true

    });

    if (
        !courses.length
    ) {

        return `
No courses available currently.
`;
    }

    return courses

    .map(course => `

COURSE NAME:
${course.name}

DURATION:
${course.duration}

FEES:
${course.fees}

EMI:
${course.emi}

SYLLABUS:
${course.syllabus}

PROJECTS:
${course.projects}

PLACEMENT:
${course.placement}

`)

    .join("\n");
};

module.exports = {

    getKnowledgeBase
};