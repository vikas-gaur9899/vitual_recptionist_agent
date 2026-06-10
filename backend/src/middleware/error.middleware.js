/**
 * Global Error Handler
 *
 * This must be the LAST middleware
 * in app.js / server.js
 */

const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error("ERROR =>", err);

    const statusCode =
        err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message:
            err.message ||
            "Internal Server Error"
    });
};

module.exports = errorHandler;