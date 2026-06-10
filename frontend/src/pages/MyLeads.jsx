import { useEffect, useState } from "react";
import { getLeadsApi } from "../api/leads.api";
import { getCallsApi } from "../api/calls.api";
import Badge from "../components/ui/Badge";
import UpdateLeadModal from "../modals/UpdateLeadModal";
import toast from "react-hot-toast";

function initials(name) {
  return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.getDate() === t.getDate() &&
    d.getMonth()   === t.getMonth() &&
    d.getFullYear() === t.getFullYear();
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && !isToday(dateStr);
}

// ── Status color ──
function timelineColor(status) {
  if (status === "Converted")    return "#16a34a";
  if (status === "Follow-up")    return "#d97706";
  if (status === "Not Converted" || status === "Not Interested") return "#dc2626";
  if (status === "Resolved")     return "#16a34a";
  if (status === "Not Resolved") return "#dc2626";
  return "#2563eb";
}

// ── Lead Detail Modal — timeline + calls ──
function LeadDetailModal({ lead, onClose }) {

  const [calls,    setCalls]    = useState([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [tab,      setTab]      = useState("timeline"); // timeline | calls

  useEffect(() => {
    getCallsApi({ limit: 50 })
      .then(r => {
        const all = r.data.calls || [];
        setCalls(all.filter(c =>
          c.from?.includes(lead.phoneNumber) ||
          c.to?.includes(lead.phoneNumber)
        ));
      })
      .catch(() => {})
      .finally(() => setCallsLoading(false));
  }, [lead]);

  const timeline = lead.timeline || [];

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 620, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0 }}>{lead.name}</h3>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
              📞 {lead.phoneNumber} · {lead.interest || "—"} · {lead.location || "—"}
            </div>
          </div>
          <span style={{ cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }} onClick={onClose}>✕</span>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", flexShrink: 0 }}>
          <Badge label={lead.leadScore || "Cold"} />
          <Badge label={lead.priority  || "Medium"} />
          <Badge label={lead.sentiment || "Neutral"} />
          <Badge label={lead.status} />
          {lead.followUpDate && (
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 20,
              background: isToday(lead.followUpDate) ? "var(--green-light)" : isOverdue(lead.followUpDate) ? "var(--red-light)" : "var(--amber-light)",
              color: isToday(lead.followUpDate) ? "var(--green-text)" : isOverdue(lead.followUpDate) ? "var(--red-text)" : "var(--amber-text)",
              fontWeight: 600
            }}>
              {isToday(lead.followUpDate) ? "📅 Follow-up Today" : isOverdue(lead.followUpDate) ? "⚠️ Overdue" : `📅 ${new Date(lead.followUpDate).toLocaleDateString("en-IN")}`}
            </span>
          )}
        </div>

        {/* AI Summary */}
        {lead.summary && (
          <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 4, textTransform: "uppercase" }}>AI Summary</div>
            {lead.summary}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {["timeline", "calls"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", fontSize: 13, cursor: "pointer",
                border: "none", background: "none",
                borderBottom: tab === t ? "2px solid var(--blue)" : "2px solid transparent",
                color: tab === t ? "var(--blue-text)" : "var(--text-secondary)",
                fontWeight: tab === t ? 600 : 400
              }}
            >
              {t === "timeline" ? `Timeline (${timeline.length})` : `Calls (${calls.length})`}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ── Timeline Tab ── */}
          {tab === "timeline" && (
            timeline.length === 0 ? (
              <div className="empty" style={{ padding: "20px 0" }}>No updates yet</div>
            ) : (
              <div style={{ position: "relative", paddingLeft: 24 }}>

                {/* Vertical line */}
                <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "var(--border)" }} />

                {[...timeline].reverse().map((entry, i) => (
                  <div key={i} style={{ position: "relative", marginBottom: 20 }}>

                    {/* Dot */}
                    <div style={{
                      position: "absolute", left: -20, top: 4,
                      width: 12, height: 12, borderRadius: "50%",
                      background: timelineColor(entry.status),
                      border: "2px solid var(--bg-primary)"
                    }} />

                    {/* Card */}
                    <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>

                      {/* Status + time */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                          background: timelineColor(entry.status) + "20",
                          color: timelineColor(entry.status)
                        }}>
                          {entry.status}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                          {new Date(entry.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Summary */}
                      {entry.summary && (
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
                          {entry.summary}
                        </div>
                      )}

                      {/* Meta info */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: "var(--text-tertiary)" }}>
                        {entry.updatedBy && (
                          <span>👤 {entry.updatedBy} ({entry.updatedByRole})</span>
                        )}
                        {entry.callDuration && (
                          <span>⏱️ {entry.callDuration}</span>
                        )}
                        {entry.callTime && (
                          <span>📞 {new Date(entry.callTime).toLocaleString("en-IN")}</span>
                        )}
                        {entry.followUpDate && (
                          <span>📅 Next Follow-up: {new Date(entry.followUpDate).toLocaleDateString("en-IN")}</span>
                        )}
                        {entry.coursePurchased && (
                          <span>🎓 Course: {entry.coursePurchased}</span>
                        )}
                        {entry.queryResolved !== null && entry.queryResolved !== undefined && (
                          <span>{entry.queryResolved ? "✅ Query Resolved" : "❌ Query Not Resolved"}</span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Calls Tab ── */}
          {tab === "calls" && (
            callsLoading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : calls.length === 0 ? (
              <div className="empty" style={{ padding: "20px 0" }}>No calls found</div>
            ) : (
              calls.map((call, i) => (
                <div key={call._id} style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: expanded === i ? "var(--bg-secondary)" : "var(--bg-primary)" }}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{new Date(call.createdAt).toLocaleString("en-IN")}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                        {call.intent || "—"} · {Math.floor((call.duration || 0) / 60)}m {(call.duration || 0) % 60}s
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge label={call.sentiment || "Neutral"} />
                      {call.leadGenerated && <Badge label="Lead" />}
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{expanded === i ? "▲" : "▼"}</span>
                  </div>

                  {expanded === i && (
                    <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "14px 16px" }}>
                      {call.summary && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase" }}>Summary</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{call.summary}</div>
                        </div>
                      )}
                      {call.transcript?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 8, textTransform: "uppercase" }}>Transcript</div>
                          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                            {call.transcript.map((t, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: t.role === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                  fontSize: 12, padding: "8px 12px", maxWidth: "75%", lineHeight: 1.5,
                                  borderRadius: t.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                  background: t.role === "user" ? "var(--blue)" : "var(--bg-primary)",
                                  color: t.role === "user" ? "#fff" : "var(--text-primary)",
                                  border: t.role === "user" ? "none" : "1px solid var(--border)"
                                }}>
                                  {t.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )
          )}

        </div>
      </div>
    </div>
  );
}

// ── Main ──
export default function MyLeads() {

  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("active");
  const [selectedLead, setSelectedLead] = useState(null);
  const [updateLead,   setUpdateLead]   = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await getLeadsApi({ myLeads: true });
      setLeads(res.data.leads || []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // ── Today's follow-ups count ──
  const todayFollowUps = leads.filter(l =>
    l.status === "Follow-up" && isToday(l.followUpDate)
  ).length;

  const overdueFollowUps = leads.filter(l =>
    l.status === "Follow-up" && isOverdue(l.followUpDate)
  ).length;

  // ── Filter logic ──
  const filteredLeads = leads.filter(lead => {
    if (filter === "active")   return !["Converted","Closed","Resolved","Not Converted","Not Interested","Not Resolved"].includes(lead.status);
    if (filter === "today")    return lead.status === "Follow-up" && isToday(lead.followUpDate);
    if (filter === "overdue")  return lead.status === "Follow-up" && isOverdue(lead.followUpDate);
    if (filter === "followup") return lead.status === "Follow-up";
    if (filter === "new")      return lead.status === "New" || lead.status === "Assigned";
    if (filter === "done")     return ["Converted","Closed","Resolved","Not Converted","Not Interested","Not Resolved"].includes(lead.status);
    return true;
  });

  const FILTERS = [
    { label: "Active",    value: "active" },
    { label: "New",       value: "new" },
    { label: "Follow-up", value: "followup" },
    {
      label: todayFollowUps > 0
        ? `Today's Follow-ups 🔴`
        : "Today's Follow-ups",
      value: "today"
    },
    {
      label: overdueFollowUps > 0
        ? `Overdue ⚠️`
        : "Overdue",
      value: "overdue"
    },
    { label: "Completed", value: "done" }
  ];

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2>My Assigned Leads</h2>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
            Name pe click karo — full lifecycle dekhne ke liye
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {todayFollowUps > 0 && (
            <div style={{ background: "var(--red-light)", color: "var(--red-text)", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>
              🔔 {todayFollowUps} follow-up{todayFollowUps > 1 ? "s" : ""} aaj
            </div>
          )}
          {overdueFollowUps > 0 && (
            <div style={{ background: "var(--amber-light)", color: "var(--amber-text)", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>
              ⚠️ {overdueFollowUps} overdue
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            {filteredLeads.length} leads
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div className="filter-group" style={{ flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`btn btn-ghost btn-sm ${filter === f.value ? "active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span style={{ marginLeft: 4, background: "rgba(0,0,0,0.1)", borderRadius: 10, padding: "0 6px", fontSize: 10 }}>
                {leads.filter(l => {
                  if (f.value === "active")   return !["Converted","Closed","Resolved","Not Converted","Not Interested","Not Resolved"].includes(l.status);
                  if (f.value === "today")    return l.status === "Follow-up" && isToday(l.followUpDate);
                  if (f.value === "overdue")  return l.status === "Follow-up" && isOverdue(l.followUpDate);
                  if (f.value === "followup") return l.status === "Follow-up";
                  if (f.value === "new")      return l.status === "New" || l.status === "Assigned";
                  if (f.value === "done")     return ["Converted","Closed","Resolved","Not Converted","Not Interested","Not Resolved"].includes(l.status);
                  return true;
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-scroll">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Course</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Follow Up</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">No leads found</td>
                </tr>
              )}

              {filteredLeads.map(lead => {
                const followUpToday   = isToday(lead.followUpDate)   && lead.status === "Follow-up";
                const followUpOverdue = isOverdue(lead.followUpDate) && lead.status === "Follow-up";

                return (
                  <tr
                    key={lead._id}
                    style={{
                      background: followUpToday   ? "var(--green-light)" :
                                  followUpOverdue ? "var(--red-light)"   : undefined
                    }}
                  >

                    {/* Name */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setSelectedLead(lead)}>
                        <div className="avatar avatar-sm">{initials(lead.name)}</div>
                        <span style={{ fontWeight: 500, color: "var(--blue)", textDecoration: "underline" }}>
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.phoneNumber || "—"}</td>
                    <td><Badge label={lead.type || "lead"} /></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{lead.interest || "—"}</td>
                    <td><Badge label={lead.priority || "Medium"} /></td>
                    <td><Badge label={lead.status} /></td>

                    {/* Follow Up */}
                    <td style={{ fontSize: 12 }}>
                      {lead.followUpDate ? (
                        <span style={{
                          color: followUpToday ? "var(--green-text)" : followUpOverdue ? "var(--red-text)" : "var(--amber-text)",
                          fontWeight: (followUpToday || followUpOverdue) ? 600 : 400
                        }}>
                          {followUpToday   ? "📅 Today"   :
                           followUpOverdue ? "⚠️ Overdue" :
                           new Date(lead.followUpDate).toLocaleDateString("en-IN")}
                        </span>
                      ) : "—"}
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setUpdateLead(lead)}
                      >
                        Update
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Update Lead Modal */}
      {updateLead && (
        <UpdateLeadModal
          open={!!updateLead}
          lead={updateLead}
          onClose={() => setUpdateLead(null)}
          onSuccess={() => { fetchLeads(); setUpdateLead(null); }}
        />
      )}

    </div>
  );
}