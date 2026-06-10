const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 */
const protect = async (
    req,
    res,
    next
) => {

    try {

        const header =
            req.headers.authorization;

        if (
            !header ||
            !header.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401)
            .json({

                success: false,

                message:
                    "No token provided"
            });
        }

        const token =
            header.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const user =
            await User.findById(
                decoded.id
            )
            .select("-password");

        if (
            !user ||
            !user.isActive
        ) {

            return res.status(401)
            .json({

                success: false,

                message:
                    "User not found or inactive"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401)
        .json({

            success: false,

            message:
                "Invalid token"
        });
    }
};

/**
 * Admin Access
 */
const adminOnly = (
    req,
    res,
    next
) => {

    if (
        ![
            "super_admin",
            "admin"
        ].includes(
            req.user.role
        )
    ) {

        return res.status(403)
        .json({

            success: false,

            message:
                "Admin access required"
        });
    }

    next();
};

/**
 * Super Admin Only
 */
const superAdminOnly = (
    req,
    res,
    next
) => {

    if (
        req.user.role !==
        "super_admin"
    ) {

        return res.status(403)
        .json({

            success: false,

            message:
                "Super Admin access required"
        });
    }

    next();
};

/**
 * Dynamic Role Middleware
 *
 * Example:
 *
 * allowRoles(
 *   "admin",
 *   "super_admin"
 * )
 */

const allowRoles =
(...roles) => {

    return (
        req,
        res,
        next
    ) => {

        if (
            !roles.includes(
                req.user.role
            )
        ) {

            return res.status(403)
            .json({

                success: false,

                message:
                    "Access denied"
            });
        }

        next();
    };
};

module.exports = {

    protect,

    adminOnly,

    superAdminOnly,

    allowRoles
};