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

  const { user } = useAuth();
  const isAdmin  = user?.role === "admin";

  const fetchLogs = async () => {
    try {
      const res = await getActivities();
      setLogs(res.data || []);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {

    // ✅ Admin ke liye sirf executive activity dikhao
    if (isAdmin && log.userRole !== "executive") return false;

    const roleMatch = role === "All" ? true : log.userRole === role;

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

        {/* ✅ Super admin ko sab roles dikhao, admin ko sirf executive filter */}
        {!isAdmin && (
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