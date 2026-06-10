import { useState, useEffect } from "react";
import { updateLeadApi } from "../api/leads.api";
import { getCoursesApi } from "../api/course.api";
import toast from "react-hot-toast";

const LEAD_STATUSES      = ["Follow-up", "Converted", "Not Converted", "Not Interested"];
const COMPLAINT_STATUSES = ["In Progress", "Resolved", "Not Resolved"];

export default function UpdateLeadModal({ open, lead, onClose, onSuccess }) {

  const isComplaint = lead?.type === "complaint";
  const STATUSES    = isComplaint ? COMPLAINT_STATUSES : LEAD_STATUSES;

  const [form, setForm] = useState({
    status:          STATUSES[0],
    summary:         "",
    followUpDate:    "",
    callDuration:    "",
    callTime:        new Date().toISOString().slice(0, 16),
    coursePurchased: "",
    queryResolved:   false
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      status:          STATUSES[0],
      summary:         "",
      followUpDate:    "",
      callDuration:    "",
      callTime:        new Date().toISOString().slice(0, 16),
      coursePurchased: lead?.interest || "",
      queryResolved:   false
    });

    // Courses fetch — har baar open hone pe
    getCoursesApi()
      .then(r => {
        // Backend se aane wale response ke sab formats handle karo
        const list =
          r.data?.data ||
          r.data?.courses ||
          (Array.isArray(r.data) ? r.data : []);
        setCourses(list);
      })
      .catch(() => setCourses([]));

  }, [open, lead]);

  if (!open || !lead) return null;

  const isConverted = form.status === "Converted";
  const isFollowUp  = form.status === "Follow-up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isConverted && !form.coursePurchased) {
      return toast.error("Please select the course purchased");
    }
    if (isFollowUp && !form.followUpDate) {
      return toast.error("Please select follow-up date");
    }
    setLoading(true);
    try {
      await updateLeadApi(lead._id, {
        status:          form.status,
        summary:         form.summary,
        followUpDate:    isFollowUp  ? form.followUpDate    : undefined,
        callDuration:    form.callDuration,
        callTime:        form.callTime,
        coursePurchased: isConverted ? form.coursePurchased : undefined,
        queryResolved:   isComplaint ? form.queryResolved   : undefined
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
      <div className="modal-card" style={{ maxWidth: 440, width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}>Update Lead</h3>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
              {lead.name} · {lead.phoneNumber}
            </div>
          </div>
          <span style={{ cursor: "pointer", fontSize: 18, color: "var(--text-tertiary)" }} onClick={onClose}>✕</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 14 }}>

            {/* Status buttons */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
                Status *
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      padding: "8px 6px",
                      borderRadius: 8,
                      border: form.status === s ? "2px solid var(--blue)" : "1px solid var(--border)",
                      background: form.status === s ? "var(--blue-light)" : "var(--bg-secondary)",
                      color: form.status === s ? "var(--blue-text)" : "var(--text-secondary)",
                      fontWeight: form.status === s ? 600 : 400,
                      fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Date & Time */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Call Date & Time
              </label>
              <input
                type="datetime-local"
                className="input"
                value={form.callTime}
                onChange={e => setForm({ ...form, callTime: e.target.value })}
              />
            </div>

            {/* Call Duration */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Call Duration
              </label>
              <input
                className="input"
                placeholder="e.g. 5 mins, 2 mins 30 sec"
                value={form.callDuration}
                onChange={e => setForm({ ...form, callDuration: e.target.value })}
              />
            </div>

            {/* Summary */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Summary *
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Kya baat hui, customer ne kya kaha..."
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                required
              />
            </div>

            {/* Follow Up Date */}
            {isFollowUp && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Follow Up Date *
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.followUpDate}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Course Purchased — Converted pe */}
            {isConverted && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Course Purchased *
                </label>
                {courses.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "8px 0" }}>
                    Loading courses...
                  </div>
                ) : (
                  <select
                    className="input"
                    value={form.coursePurchased}
                    onChange={e => setForm({ ...form, coursePurchased: e.target.value })}
                    required
                  >
                    <option value="">Select course...</option>
                    {courses.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Query Resolved — complaint pe */}
            {isComplaint && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  id="qr"
                  checked={form.queryResolved}
                  onChange={e => setForm({ ...form, queryResolved: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="qr" style={{ fontSize: 13, cursor: "pointer" }}>
                  Query / Complaint Resolved
                </label>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Saving..." : "Update Lead"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}