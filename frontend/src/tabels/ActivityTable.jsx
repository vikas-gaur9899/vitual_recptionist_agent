import Badge from "../components/ui/Badge";

function getDetails(log) {
  const d = log.details || {};

  if (log.action === "CREATE_ADMIN") {
    return `Created Admin: ${d.adminName || "—"} (${d.email || "—"})`;
  }
  if (log.action === "CREATE_EXECUTIVE") {
    return `Created Executive: ${d.executiveName || "—"}`;
  }
  if (log.action === "DISABLE_USER") {
    return `Disabled: ${d.disabledUser || "—"}`;
  }
  if (log.action === "ENABLE_USER") {
    return `Enabled: ${d.enabledUser || "—"}`;
  }
  if (log.action === "DELETE_USER") {
    return `Deleted: ${d.deletedUser || "—"}`;
  }
  if (log.action === "ASSIGN_LEAD") {
    return `Lead: ${log.customerName || "—"} (${log.customerPhone || "—"})`;
  }
  if (log.action === "UPDATE_LEAD_STATUS") {
    return `${log.customerName || "—"} — ${log.oldStatus || "?"} → ${log.newStatus || "?"}`;
  }
  if (log.action === "LEAD_CONVERTED") {
    return `Converted: ${log.customerName || "—"}`;
  }
  if (log.action === "COMPLAINT_RESOLVED") {
    return `Resolved: ${log.customerName || "—"}`;
  }

  // fallback — kuch bhi ho toh details object string karo
  if (Object.keys(d).length > 0) {
    return Object.values(d).join(", ");
  }

  return log.summary || "—";
}

export default function ActivityTable({ logs = [] }) {

  return (

    <table>

      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Action</th>
          <th>Details</th>
          <th>Entity</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>

        {logs.length === 0 && (
          <tr>
            <td colSpan={6} className="empty">No activity logs</td>
          </tr>
        )}

        {logs.map(log => (

          <tr key={log._id}>

            <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
              {log.userName}
            </td>

            <td>
              <Badge label={log.userRole} />
            </td>

            <td style={{ color: "var(--text-secondary)" }}>
              {log.action}
            </td>

            {/* Details — kisne kisko create kiya etc */}
            <td
              style={{
                color: "var(--text-secondary)",
                maxWidth: 260,
                whiteSpace: "normal",
                lineHeight: 1.4
              }}
            >
              {getDetails(log)}
            </td>

            <td>
              <Badge label={log.entityType} />
            </td>

            <td style={{ color: "var(--text-tertiary)" }}>
              {new Date(log.createdAt).toLocaleString("en-IN")}
            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}