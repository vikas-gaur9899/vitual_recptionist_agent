import { useEffect, useState } from "react";
import { getLeadsApi } from "../api/leads.api";
import Badge from "../components/ui/Badge";
import UpdateLeadModal from "../modals/UpdateLeadModal";
import toast from "react-hot-toast";

const FILTERS = ["All", "Hot", "Warm", "Cold"];

function initials(name) {
  return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Leads() {
  const [leads,      setLeads]      = useState([]);
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [updateLead, setUpdateLead] = useState(null); // modal ke liye

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

  return (
    <div>

      {/* Filters */}
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

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
            <table style={{ tableLayout: "fixed", minWidth: 1300 }}>

              <thead>
                <tr>
                  <th style={{ width: 160 }}>Name</th>
                  <th style={{ width: 140 }}>Course</th>
                  <th style={{ width: 100 }}>City</th>
                  <th style={{ width: 90  }}>Mode</th>
                  <th style={{ width: 90  }}>Priority</th>
                  <th style={{ width: 80  }}>Score</th>
                  <th style={{ width: 90  }}>Sentiment</th>
                  <th style={{ width: 130 }}>Assigned To</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 110 }}>Phone</th>
                  <th style={{ width: 90  }}>Date</th>
                  <th style={{ width: 90  }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={12} className="empty">No leads found</td>
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
                    <td className="truncate" title={lead.interest}>
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

                    {/* Assigned To */}
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
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Unassigned</span>
                      )}
                    </td>

                    {/* Status — sirf badge, no dropdown */}
                    <td>
                      <Badge label={lead.status} />
                    </td>

                    {/* Phone */}
                    <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                      {lead.phoneNumber}
                    </td>

                    {/* Date */}
                    <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    {/* Action — Update button */}
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setUpdateLead(lead)}
                      >
                        Update
                      </button>
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

      {/* Update Lead Modal */}
      {updateLead && (
        <UpdateLeadModal
          open={!!updateLead}
          lead={updateLead}
          onClose={() => setUpdateLead(null)}
          onSuccess={() => {
            fetchLeads();
            setUpdateLead(null);
          }}
        />
      )}

    </div>
  );
}