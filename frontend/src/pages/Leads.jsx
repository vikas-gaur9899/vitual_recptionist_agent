import { useEffect, useState } from "react";
import { getLeadsApi, updateLeadApi } from "../api/leads.api";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const FILTERS  = ["All","Hot","Warm","Cold"];
const STATUSES = ["New","Contacted","Qualified","Follow-up","Converted","Closed"];

function initials(name) {
  return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Leads() {
  const [leads,   setLeads]   = useState([]);
  const [filter,  setFilter]  = useState("All");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = () => {
    setLoading(true);
    const params = {};
    if (filter !== "All") params.leadScore = filter;
    if (search.trim())    params.search    = search.trim();
    getLeadsApi(params)
      .then(r => setLeads(r.data.leads || []))
      .catch(() => toast.error("Failed to load leads"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateStatus = async (id, status) => {
    try {
      await updateLeadApi(id, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div>

      <div className="filter-row">
        <div className="filter-group">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`btn btn-ghost btn-sm ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className="input input-sm"
          style={{ width: 220 }}
          placeholder="Search name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
            <table style={{ tableLayout: "fixed", minWidth: 1250 }}>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>City</th>
                  <th>Mode</th>
                  <th>Priority</th>
                  <th>Score</th>
                  <th>Sentiment</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={11} className="empty">No leads found</td>
                  </tr>
                )}

                {leads.map(lead => (
                  <tr key={lead._id}>

                    {/* Name */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar avatar-sm">{initials(lead.name)}</div>
                        <span className="truncate" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="truncate" title={lead.summary}>
                      {lead.interest || "—"}
                    </td>

                    {/* City */}
                    <td>{lead.location || "—"}</td>

                    {/* Mode */}
                    <td><Badge label={lead.mode || "Not Specified"} /></td>

                    {/* Priority */}
                    <td><Badge label={lead.priority || "Medium"} /></td>

                    {/* Score */}
                    <td><Badge label={lead.leadScore || "Cold"} /></td>

                    {/* Sentiment */}
                    <td><Badge label={lead.sentiment || "Neutral"} /></td>

                    {/* Assigned To — executive ka naam */}
                    <td>
                      {lead.assignedTo ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div className="avatar avatar-sm" style={{ background: "var(--green-light)", color: "var(--green-text)" }}>
                            {initials(lead.assignedTo.name)}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {lead.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        className="input input-sm"
                        style={{ width: "100%" }}
                        value={lead.status}
                        onChange={e => updateStatus(lead._id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* Phone */}
                    <td style={{ color: "var(--text-tertiary)" }}>
                      {lead.phoneNumber}
                    </td>

                    {/* Date */}
                    <td style={{ color: "var(--text-tertiary)" }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 10 }}>
        {leads.length} leads
      </p>

    </div>
  );
}