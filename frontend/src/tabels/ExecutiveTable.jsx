import Badge from "../components/ui/Badge";

export default function ExecutiveTable({
  executives = [],
  onEnable,
  onDisable,
  onDelete,
  onEdit
}) {

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {executives.length === 0 && (
          <tr><td colSpan={5} className="empty">No executives found</td></tr>
        )}
        {executives.map(user => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phone || "—"}</td>
            <td>
              <Badge label={user.isActive ? "Active" : "Disabled"} />
            </td>
            <td>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => onEdit?.(user)}>
                  Edit
                </button>
                {user.isActive ? (
                  <button className="btn btn-sm" onClick={() => onDisable(user._id)}>Disable</button>
                ) : (
                  <button className="btn btn-sm" onClick={() => onEnable(user._id)}>Enable</button>
                )}
                <button className="btn btn-sm" style={{ color: "var(--red)" }} onClick={() => onDelete(user._id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}