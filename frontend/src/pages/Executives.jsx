import { useEffect, useState } from "react";
import { getUsers, enableUser, disableUser, deleteUser } from "../api/users.api";
import ExecutiveTable from "../tabels/ExecutiveTable";
import CreateExecutiveModal from "../modals/CreateExecutiveModal";
import EditUserModal from "../modals/EditUserModal";
import toast from "react-hot-toast";

export default function Executives() {

  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser,      setEditUser]      = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers((res.data || []).filter(u => u.role === "executive"));
    } catch {
      toast.error("Failed to load executives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEnable  = async (id) => {
    try { await enableUser(id);  toast.success("Executive enabled");  fetchUsers(); }
    catch { toast.error("Enable failed"); }
  };

  const handleDisable = async (id) => {
    try { await disableUser(id); toast.success("Executive disabled"); fetchUsers(); }
    catch { toast.error("Disable failed"); }
  };

  const handleDelete  = async (id) => {
    if (!window.confirm("Delete executive?")) return;
    try { await deleteUser(id);  toast.success("Executive deleted");  fetchUsers(); }
    catch { toast.error("Delete failed"); }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Executives</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          Create Executive
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-scroll">
            <ExecutiveTable
              executives={users}
              onEnable={handleEnable}
              onDisable={handleDisable}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>

      <CreateExecutiveModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        open={showEditModal}
        user={editUser}
        onClose={() => { setShowEditModal(false); setEditUser(null); }}
        onSuccess={fetchUsers}
      />

    </div>
  );
}