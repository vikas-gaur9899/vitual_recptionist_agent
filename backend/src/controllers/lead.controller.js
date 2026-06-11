const Lead = require("../models/Lead");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activity.service");

const getMyLeads = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === "executive") query.assignedTo = req.user._id;
    const leads = await Lead.find(query)
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, leads));
});

const getLeadById = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id)
        .populate("assignedTo", "name email");
    if (!lead) throw new ApiError(404, "Lead not found");
    return res.status(200).json(new ApiResponse(200, lead));
});

/**
 * Update Lead Status
 * Works for all roles — executive, admin, super_admin
 * Activity log + timeline dono banta hai
 */
const updateLeadStatus = asyncHandler(async (req, res) => {
    const {
        status, priority, summary, notes,
        followUpDate, callDuration, callTime,
        coursePurchased, queryResolved,
        notConvertedReason
    } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, "Lead not found");

    const oldStatus   = lead.status;
    const oldPriority = lead.priority;

    if (status)             lead.status             = status;
    if (priority)           lead.priority           = priority;
    if (summary)            lead.summary            = summary;
    if (notes)              lead.notes              = notes;
    if (followUpDate)       lead.followUpDate       = followUpDate;
    if (coursePurchased)    lead.interest           = coursePurchased;
    if (notConvertedReason) lead.notConvertedReason = notConvertedReason;

    // convertedBy track karo
    if (status === "Converted") {
        lead.convertedBy     = req.user._id;
        lead.convertedByRole = req.user.role;
    }

    lead.lastUpdatedBy = req.user._id;

    lead.timeline.push({
        status:             status        || oldStatus,
        summary:            summary       || notes || "",
        callDuration:       callDuration  || "",
        callTime:           callTime ? new Date(callTime) : new Date(),
        updatedBy:          req.user.name,
        updatedByRole:      req.user.role,
        followUpDate:       followUpDate  ? new Date(followUpDate) : null,
        coursePurchased:    coursePurchased    || null,
        notConvertedReason: notConvertedReason || null,
        queryResolved:      queryResolved      ?? null,
        createdAt:          new Date()
    });

    await lead.save();

    await logActivity({
        user:          req.user,
        action:        "UPDATE_LEAD_STATUS",
        entityType:    lead.type === "complaint" ? "complaint" : "lead",
        entityId:      lead._id,
        customerName:  lead.name,
        customerPhone: lead.phoneNumber,
        oldStatus,
        newStatus:     lead.status,
        summary:       summary || notes,
        details: {
            updatedBy:          req.user.name,
            role:               req.user.role,
            oldPriority:        oldPriority        || null,
            newPriority:        priority           || null,
            callDuration:       callDuration       || null,
            callTime:           callTime           || null,
            coursePurchased:    coursePurchased    || null,
            notConvertedReason: notConvertedReason || null,
            queryResolved:      queryResolved      ?? null
        }
    });

    return res.status(200).json(
        new ApiResponse(200, lead, "Lead updated successfully")
    );
});

const assignLead = asyncHandler(async (req, res) => {
    const { executiveId } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, "Lead not found");

    lead.assignedTo    = executiveId;
    lead.assignedBy    = req.user._id;
    lead.assignedAt    = new Date();
    lead.status        = "Assigned";
    lead.lastUpdatedBy = req.user._id;

    lead.timeline.push({
        status:        "Assigned",
        summary:       "Lead manually assigned",
        updatedBy:     req.user.name,
        updatedByRole: req.user.role,
        createdAt:     new Date()
    });

    await lead.save();

    await logActivity({
        user: req.user, action: "ASSIGN_LEAD",
        entityType: "lead", entityId: lead._id,
        customerName: lead.name, customerPhone: lead.phoneNumber,
        summary: "Lead assigned manually",
        details: { assignedBy: req.user.name }
    });

    return res.status(200).json(new ApiResponse(200, lead, "Lead assigned successfully"));
});

const convertLead = asyncHandler(async (req, res) => {
    const { summary, coursePurchased } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, "Lead not found");

    const oldStatus      = lead.status;
    lead.status          = "Converted";
    lead.summary         = summary;
    lead.convertedBy     = req.user._id;
    lead.convertedByRole = req.user.role;
    if (coursePurchased) lead.interest = coursePurchased;
    lead.lastUpdatedBy = req.user._id;

    lead.timeline.push({
        status: "Converted", summary,
        updatedBy: req.user.name, updatedByRole: req.user.role,
        coursePurchased: coursePurchased || lead.interest,
        createdAt: new Date()
    });

    await lead.save();

    await logActivity({
        user: req.user, action: "LEAD_CONVERTED",
        entityType: "lead", entityId: lead._id,
        customerName: lead.name, customerPhone: lead.phoneNumber,
        oldStatus, newStatus: "Converted", summary,
        details: { coursePurchased: coursePurchased || lead.interest, convertedBy: req.user.name }
    });

    return res.status(200).json(new ApiResponse(200, lead, "Lead converted successfully"));
});

const resolveComplaint = asyncHandler(async (req, res) => {
    const { resolutionSummary, queryResolved } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, "Complaint not found");

    lead.status            = "Resolved";
    lead.resolutionSummary = resolutionSummary;
    lead.lastUpdatedBy     = req.user._id;

    lead.timeline.push({
        status: "Resolved", summary: resolutionSummary,
        updatedBy: req.user.name, updatedByRole: req.user.role,
        queryResolved: queryResolved ?? true, createdAt: new Date()
    });

    await lead.save();

    await logActivity({
        user: req.user, action: "COMPLAINT_RESOLVED",
        entityType: "complaint", entityId: lead._id,
        customerName: lead.name, customerPhone: lead.phoneNumber,
        oldStatus: "In Progress", newStatus: "Resolved",
        summary: resolutionSummary,
        details: { resolvedBy: req.user.name, queryResolved: queryResolved ?? true }
    });

    return res.status(200).json(new ApiResponse(200, lead, "Complaint resolved"));
});

module.exports = {
    getMyLeads, getLeadById, updateLeadStatus,
    assignLead, convertLead, resolveComplaint
};