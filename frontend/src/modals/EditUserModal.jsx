import { useState } from "react";
import api from "../utils/axios";
import toast from "react-hot-toast";

export default function EditUserModal({ open, onClose, onSuccess, user }) {

  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const [newPassword,    setNewPassword]    = useState("");
  const [savedPassword,  setSavedPassword]  = useState(""); // reset ke baad yahan dikhega
  const [showPassword,   setShowPassword]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [pwLoading,      setPwLoading]      = useState(false);

  if (!open || !user) return null;

  // ── Update Details
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/users/${user._id}/update`, form);
      toast.success("Details updated");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setPwLoading(true);
    try {
      await api.put(`/api/users/${user._id}/reset-password`, { newPassword });
      toast.success("Password reset successfully");
      setSavedPassword(newPassword); // save karke dikhao
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(savedPassword);
    toast.success("Password copied to clipboard!");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 460, width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Edit — {user.name}</h3>
          <span
            style={{ cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }}
            onClick={() => { onClose(); setSavedPassword(""); }}
          >✕</span>
        </div>

        {/* Role + Email */}
        <div style={{ marginBottom: 16 }}>
          <span className={`badge ${user.role === "admin" ? "badge-qualified" : "badge-new"}`}>
            {user.role}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: 8 }}>
            {user.email}
          </span>
        </div>

        {/* ── Update Details ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Update Details
          </div>
          <form onSubmit={handleUpdate}>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="input"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

        {/* ── Reset Password ── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Reset Password
          </div>
          <form onSubmit={handlePasswordReset}>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="input"
                placeholder="New Password (min 6 chars)"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                className="btn"
                style={{ background: "var(--amber-light)", color: "var(--amber-text)", border: "1px solid var(--amber)" }}
                disabled={pwLoading}
              >
                {pwLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>

          {/* ── Password Copy Box — reset ke baad dikhega ── */}
          {savedPassword && (
            <div style={{
              marginTop: 16,
              background: "var(--green-light)",
              border: "1px solid var(--green)",
              borderRadius: 10,
              padding: "12px 14px"
            }}>
              <div style={{ fontSize: 11, color: "var(--green-text)", fontWeight: 600, marginBottom: 8 }}>
                ✅ Password Reset Successfully — Share with user:
              </div>

              {/* Password display */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  flex: 1,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: showPassword ? 0 : 3,
                  color: "var(--text-primary)",
                  fontFamily: "monospace"
                }}>
                  {showPassword ? savedPassword : "•".repeat(savedPassword.length)}
                </div>

                {/* Show/Hide toggle */}
                <button
                  className="btn btn-sm btn-ghost"
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {/* Copy button */}
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={handleCopy}
                >
                  Copy
                </button>
              </div>

              {/* Email + Password info for sharing */}
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>
                <div>📧 Email: <strong>{user.email}</strong></div>
                <div>🔑 Password: <strong>{showPassword ? savedPassword : "Click Show to reveal"}</strong></div>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-tertiary)" }}>
                Copy karke WhatsApp/Email pe bhej do
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}