import { useEffect, useState } from "react";
import { getActivities } from "../api/activity.api";
import ActivityTable from "../tabels/ActivityTable";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogs() {

  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("All");

  const { user }        = useAuth();
  const isSuperAdmin    = user?.role === "super_admin";
  const isAdmin         = user?.role === "admin";

  const fetchLogs = async () => {
    try {
      const res = await getActivities();
      // Backend se aata hai res.data — check karo structure
      const data = res.data?.data || res.data || [];
      setLogs(data);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {

    // Admin ke liye sirf executive + admin activity dikhao
    // (apni team ki activity — super_admin ki nahi)
    if (isAdmin) {
      if (!["executive", "admin"].includes(log.userRole)) return false;
    }

    // Role filter — super_admin sab dekh sakta hai
    const roleMatch = role === "All" ? true : log.userRole === role;

    // Search filter
    const searchMatch = search
      ? log.userName?.toLowerCase().includes(search.toLowerCase())
      : true;

    return roleMatch && searchMatch;
  });

  return (
    <div>

      <div className="filter-row">

        <input
          className="input input-sm"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Role filter — super_admin ko sab options, admin ko executive only */}
        {isSuperAdmin && (
          <select
            className="input input-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="executive">Executive</option>
          </select>
        )}

        {isAdmin && (
          <select
            className="input input-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">All</option>
            <option value="executive">Executive</option>
            <option value="admin">Admin</option>
          </select>
        )}

      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
            <ActivityTable logs={filteredLogs} />
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, marginTop: 10, color: "var(--text-tertiary)" }}>
        Total Logs: {filteredLogs.length}
      </p>

    </div>
  );
}