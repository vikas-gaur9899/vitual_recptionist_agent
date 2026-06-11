import { useState, useEffect } from "react";
import { updateLeadApi } from "../api/leads.api";
import { getCoursesApi } from "../api/course.api";
import toast from "react-hot-toast";

const LEAD_STATUSES      = ["New", "Follow-up", "Converted", "Not Converted"];
const COMPLAINT_STATUSES = ["In Progress", "Resolved", "Not Resolved"];
const PRIORITIES         = ["Low", "Medium", "High", "Critical"];

const NOT_CONVERTED_REASONS = [
    "High Price",
    "Syllabus Not Matching",
    "Location Issue",
    "Timing Not Suitable",
    "Joined Competitor",
    "Not Interested Anymore",
    "No Response",
    "Other"
];

export default function UpdateLeadModal({ open, lead, onClose, onSuccess }) {

  const isComplaint = lead?.type === "complaint";
  const STATUSES    = isComplaint ? COMPLAINT_STATUSES : LEAD_STATUSES;

  const [form, setForm] = useState({
    status:             "",
    priority:           "",
    summary:            "",
    followUpDate:       "",
    callDuration:       "",
    callTime:           new Date().toISOString().slice(0, 16),
    coursePurchased:    "",
    notConvertedReason: "",
    queryResolved:      false
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !lead) return;

    setForm({
      status:          lead.status && STATUSES.includes(lead.status)
                         ? lead.status : STATUSES[0],
      priority:        lead.priority || "Medium",
      summary:         "",
      followUpDate:    lead.followUpDate ? lead.followUpDate.split("T")[0] : "",
      callDuration:    "",
      callTime:        new Date().toISOString().slice(0, 16),
      coursePurchased: lead.interest || "",
      notConvertedReason: "",
      queryResolved:   false
    });

    getCoursesApi()
      .then(r => {
        const list = r.data?.data || r.data?.courses || (Array.isArray(r.data) ? r.data : []);
        setCourses(list);
      })
      .catch(() => setCourses([]));

  }, [open, lead]);

  if (!open || !lead) return null;

  const isConverted    = form.status === "Converted";
  const isFollowUp     = form.status === "Follow-up";
  const isNotConverted = form.status === "Not Converted";

  // Status button colors
  const statusColors = {
    "New":           { sel: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" },
    "Follow-up":     { sel: "#d97706", bg: "#fffbeb", text: "#b45309" },
    "Converted":     { sel: "#16a34a", bg: "#f0fdf4", text: "#15803d" },
    "Not Converted": { sel: "#dc2626", bg: "#fef2f2", text: "#b91c1c" },
    "In Progress":   { sel: "#7c3aed", bg: "#f5f3ff", text: "#6d28d9" },
    "Resolved":      { sel: "#16a34a", bg: "#f0fdf4", text: "#15803d" },
    "Not Resolved":  { sel: "#dc2626", bg: "#fef2f2", text: "#b91c1c" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.summary.trim()) return toast.error("Summary likhna zaroori hai");
    if (isConverted    && !form.coursePurchased)    return toast.error("Course select karo jo purchase hua");
    if (isFollowUp     && !form.followUpDate)        return toast.error("Follow-up date select karo");
    if (isNotConverted && !form.notConvertedReason)  return toast.error("Reason select karo — not converted kyun?");

    setLoading(true);
    try {
      await updateLeadApi(lead._id, {
        status:             form.status,
        priority:           form.priority,
        summary:            form.summary,
        followUpDate:       isFollowUp     ? form.followUpDate       : undefined,
        callDuration:       form.callDuration  || undefined,
        callTime:           form.callTime      || undefined,
        coursePurchased:    isConverted    ? form.coursePurchased    : undefined,
        notConvertedReason: isNotConverted ? form.notConvertedReason : undefined,
        queryResolved:      isComplaint    ? form.queryResolved      : undefined
      });
      toast.success("Lead updated!");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}>Update Lead</h3>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
              {lead.name} · {lead.phoneNumber}
              {lead.interest && <span> · {lead.interest}</span>}
            </div>
          </div>
          <span style={{ cursor: "pointer", fontSize: 18, color: "var(--text-tertiary)" }} onClick={onClose}>✕</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 16 }}>

            {/* ── Status ── */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, display: "block", fontWeight: 600 }}>
                Status *
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUSES.map(s => {
                  const c = statusColors[s] || { sel: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" };
                  const isSelected = form.status === s;
                  return (
                    <button
                      key={s} type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      style={{
                        flex: 1, minWidth: 80, padding: "9px 6px", borderRadius: 8,
                        border: isSelected ? `2px solid ${c.sel}` : "1px solid var(--border)",
                        background: isSelected ? c.bg : "var(--bg-secondary)",
                        color: isSelected ? c.text : "var(--text-secondary)",
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: 11, cursor: "pointer", transition: "all 0.15s"
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Priority ── */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, display: "block", fontWeight: 600 }}>
                Priority
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {PRIORITIES.map(p => {
                  const colors = {
                    Low:      { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
                    Medium:   { bg: "#fffbeb", border: "#d97706", text: "#b45309" },
                    High:     { bg: "#fff7ed", border: "#ea580c", text: "#c2410c" },
                    Critical: { bg: "#fef2f2", border: "#dc2626", text: "#b91c1c" }
                  };
                  const c = colors[p];
                  const isSelected = form.priority === p;
                  return (
                    <button key={p} type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      style={{
                        flex: 1, padding: "8px 4px", borderRadius: 8,
                        border: isSelected ? `2px solid ${c.border}` : "1px solid var(--border)",
                        background: isSelected ? c.bg : "var(--bg-secondary)",
                        color: isSelected ? c.text : "var(--text-secondary)",
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: 11, cursor: "pointer", transition: "all 0.15s"
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Call Date & Time ── */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                Call Date & Time
              </label>
              <input type="datetime-local" className="input" value={form.callTime}
                onChange={e => setForm({ ...form, callTime: e.target.value })} />
            </div>

            {/* ── Call Duration ── */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                Call Duration
              </label>
              <input className="input" placeholder="e.g. 5 mins, 2 mins 30 sec"
                value={form.callDuration}
                onChange={e => setForm({ ...form, callDuration: e.target.value })} />
            </div>

            {/* ── Summary ── */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                Summary *
              </label>
              <textarea className="input" rows={3}
                placeholder="Kya baat hui, customer ne kya kaha..."
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                required />
            </div>

            {/* ── Follow Up Date ── */}
            {isFollowUp && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                  Follow Up Date *
                </label>
                <input type="date" className="input" value={form.followUpDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  required />
              </div>
            )}

            {/* ── Course Purchased (Converted) ── */}
            {isConverted && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                  Course Purchased *
                </label>
                {courses.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Loading courses...</div>
                ) : (
                  <select className="input" value={form.coursePurchased}
                    onChange={e => setForm({ ...form, coursePurchased: e.target.value })} required>
                    <option value="">Select course...</option>
                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                )}
              </div>
            )}

            {/* ── Not Converted Reason ── */}
            {isNotConverted && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                  Reason — Not Converted *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {NOT_CONVERTED_REASONS.map(reason => {
                    const isSelected = form.notConvertedReason === reason;
                    return (
                      <button
                        key={reason} type="button"
                        onClick={() => setForm({ ...form, notConvertedReason: reason })}
                        style={{
                          padding: "9px 10px", borderRadius: 8, textAlign: "left",
                          border: isSelected ? "2px solid #dc2626" : "1px solid var(--border)",
                          background: isSelected ? "#fef2f2" : "var(--bg-secondary)",
                          color: isSelected ? "#b91c1c" : "var(--text-secondary)",
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: 12, cursor: "pointer", transition: "all 0.15s"
                        }}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
                {/* Course enquired about */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block", fontWeight: 600 }}>
                    Course Enquired About
                  </label>
                  {courses.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Loading courses...</div>
                  ) : (
                    <select className="input" value={form.coursePurchased}
                      onChange={e => setForm({ ...form, coursePurchased: e.target.value })}>
                      <option value="">Select course...</option>
                      {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* ── Query Resolved (complaint) ── */}
            {isComplaint && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="qr" checked={form.queryResolved}
                  onChange={e => setForm({ ...form, queryResolved: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: "pointer" }} />
                <label htmlFor="qr" style={{ fontSize: 13, cursor: "pointer" }}>
                  Query / Complaint Resolved
                </label>
              </div>
            )}

            {/* ── Buttons ── */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Saving..." : "Update Lead"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}