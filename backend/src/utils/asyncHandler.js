/**
 * Removes repetitive try/catch blocks.
 *
 * Example:
 * router.get("/", asyncHandler(controller));
 */

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(next);
    };
};

module.exports = asyncHandler;