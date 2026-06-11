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
    const customer = log.customerName || "—";
    const phone    = log.customerPhone ? ` (${log.customerPhone})` : "";
    const oldS     = log.oldStatus || "?";
    const newS     = log.newStatus || "?";
    const by       = d.updatedBy   || log.userName || "—";
    const role     = d.role        || log.userRole || "";
    const summary  = log.summary   || "";
    const course   = d.coursePurchased ? ` · Course: ${d.coursePurchased}` : "";
    const duration = d.callDuration    ? ` · Call: ${d.callDuration}`      : "";
    const priority = d.newPriority && d.oldPriority && d.newPriority !== d.oldPriority
      ? ` · Priority: ${d.oldPriority} → ${d.newPriority}`
      : "";

    return (
      <div style={{ lineHeight: 1.6 }}>
        <div>
          <strong>{customer}</strong>{phone}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Status: <span style={{ fontWeight: 600 }}>{oldS}</span>
          {" → "}
          <span style={{ fontWeight: 600, color: newS === "Converted" ? "var(--green-text)" : newS === "Follow-up" ? "var(--amber-text)" : "var(--text-primary)" }}>
            {newS}
          </span>
          {priority}
          {course}
          {duration}
        </div>
        {summary && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
            "{summary}"
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          By: {by} ({role})
        </div>
      </div>
    );
  }

  if (log.action === "LEAD_CONVERTED") {
    const course = log.details?.coursePurchased ? ` · Course: ${log.details.coursePurchased}` : "";
    return (
      <div style={{ lineHeight: 1.6 }}>
        <div>
          <strong>{log.customerName || "—"}</strong>
          {log.customerPhone ? ` (${log.customerPhone})` : ""}
        </div>
        <div style={{ fontSize: 12, color: "var(--green-text)", fontWeight: 600 }}>
          ✅ Converted{course}
        </div>
        {log.summary && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            "{log.summary}"
          </div>
        )}
      </div>
    );
  }

  if (log.action === "COMPLAINT_RESOLVED") {
    return (
      <div style={{ lineHeight: 1.6 }}>
        <div>
          <strong>{log.customerName || "—"}</strong>
          {log.customerPhone ? ` (${log.customerPhone})` : ""}
        </div>
        <div style={{ fontSize: 12, color: "var(--green-text)", fontWeight: 600 }}>
          ✅ Complaint Resolved
        </div>
        {log.summary && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            "{log.summary}"
          </div>
        )}
      </div>
    );
  }

  if (log.action === "RESET_PASSWORD") {
    return `Reset password for: ${d.resetFor || "—"} (${d.role || "—"})`;
  }

  if (log.action === "UPDATE_USER") {
    return `Updated: ${d.updatedUser || "—"} (${d.role || "—"})`;
  }

  // fallback
  if (Object.keys(d).length > 0) {
    return Object.values(d).filter(Boolean).join(", ");
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

            <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
              {log.action}
            </td>

            <td style={{
              color: "var(--text-secondary)",
              maxWidth: 300,
              whiteSpace: "normal",
              lineHeight: 1.4,
              fontSize: 12
            }}>
              {getDetails(log)}
            </td>

            <td>
              <Badge label={log.entityType} />
            </td>

            <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
              {new Date(log.createdAt).toLocaleString("en-IN")}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}