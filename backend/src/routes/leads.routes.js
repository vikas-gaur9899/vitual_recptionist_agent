const express = require("express");
const router  = express.Router();
const Lead    = require("../models/Lead");

const {
    protect,
    allowRoles
} = require("../middleware/auth.middleware");

const {
    getMyLeads,
    updateLeadStatus,
    assignLead,
    convertLead,
    resolveComplaint
} = require("../controllers/lead.controller");

// ── Executive: apne leads ──
router.get("/my-leads", protect, getMyLeads);

// ── Status update — ALL roles, activity log + timeline dono hoga ──
router.put("/:id/status", protect, updateLeadStatus);

// ── Manual Assignment ──
router.put("/:id/assign",  protect, allowRoles("admin", "super_admin"), assignLead);

// ── Lead Conversion ──
router.put("/:id/convert", protect, convertLead);

// ── Complaint Resolution ──
router.put("/:id/resolve", protect, resolveComplaint);

// ── GET ALL LEADS ──
router.get("/", protect, async (req, res) => {
    try {
        const {
            leadScore, status, search,
            limit = 50, page = 1,
            type, assignedTo, priority, myLeads
        } = req.query;

        const filter = {};

        if (myLeads === "true" && req.user.role === "executive") {
            filter.assignedTo = req.user._id;
        }
        if (leadScore && leadScore !== "All") filter.leadScore = leadScore;
        if (status)     filter.status     = status;
        if (type)       filter.type       = type;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (priority)   filter.priority   = priority;
        if (search) {
            filter.$or = [
                { name:        { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
                { interest:    { $regex: search, $options: "i" } }
            ];
        }

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await Lead.countDocuments(filter);
        const leads = await Lead.find(filter)
            .populate("assignedTo",    "name email")
            .populate("lastUpdatedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) });

    } catch (err) {
        console.error("Get leads error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// ── GET SINGLE LEAD ──
router.get("/:id", protect, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate("assignedTo",    "name email")
            .populate("lastUpdatedBy", "name")
            .populate("sourceCall");

        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.json({ lead });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * PUT /:id — General update (admin/super_admin/executive sab)
 * ab updateLeadStatus controller use karega
 * taaki activity log + timeline dono bane
 */
router.put("/:id", protect, updateLeadStatus);

// ── DELETE LEAD ──
router.delete("/:id", protect, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.json({ message: "Lead deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;