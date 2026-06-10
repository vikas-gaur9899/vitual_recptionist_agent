import { useEffect, useState } from "react";
import { getUsers, enableUser, disableUser, deleteUser } from "../api/users.api";
import CreateAdminModal from "../modals/CreateAdminModal";
import EditUserModal from "../modals/EditUserModal";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

function initials(name) {
  return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Admins() {

  const [admins,       setAdmins]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editUser,     setEditUser]     = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await getUsers();
      setAdmins((res.data || []).filter(u => u.role === "admin"));
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleEnable  = async (id) => {
    try { await enableUser(id);  toast.success("Admin enabled");  fetchAdmins(); }
    catch { toast.error("Enable failed"); }
  };

  const handleDisable = async (id) => {
    try { await disableUser(id); toast.success("Admin disabled"); fetchAdmins(); }
    catch { toast.error("Disable failed"); }
  };

  const handleDelete  = async (id) => {
    if (!window.confirm("Delete admin?")) return;
    try { await deleteUser(id);  toast.success("Admin deleted");  fetchAdmins(); }
    catch { toast.error("Delete failed"); }
  };

  const handleEdit = (admin) => {
    setEditUser(admin);
    setShowEditModal(true);
  };

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Admins</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Admin
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
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
                {admins.length === 0 && (
                  <tr><td colSpan={5} className="empty">No admins found</td></tr>
                )}
                {admins.map(admin => (
                  <tr key={admin._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar avatar-sm">{initials(admin.name)}</div>
                        <span style={{ fontWeight: 500 }}>{admin.name}</span>
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>{admin.phone || "—"}</td>
                    <td><Badge label={admin.isActive ? "Active" : "Disabled"} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(admin)}>
                          Edit
                        </button>
                        {admin.isActive ? (
                          <button className="btn btn-sm" onClick={() => handleDisable(admin._id)}>Disable</button>
                        ) : (
                          <button className="btn btn-sm" onClick={() => handleEnable(admin._id)}>Enable</button>
                        )}
                        <button className="btn btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(admin._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAdmins}
      />

      <EditUserModal
        open={showEditModal}
        user={editUser}
        onClose={() => { setShowEditModal(false); setEditUser(null); }}
        onSuccess={fetchAdmins}
      />

    </div>
  );
}