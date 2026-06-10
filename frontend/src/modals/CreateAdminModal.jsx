import { useState } from "react";
import { createAdmin } from "../api/users.api"; // user api
import toast from "react-hot-toast";

export default function CreateAdminModal({
  open,
  onClose,
  onSuccess
}) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createAdmin(form);

      toast.success(
        "Admin created successfully"
      );

      onSuccess?.();

      onClose();

    } catch {

      toast.error(
        "Failed to create admin"
      );
    }
  };

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-card">

        <h3>Create Admin</h3>

        <form onSubmit={handleSubmit}>

          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value
              })
            }
          />

          <input
            type="password"
            className="input"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          <div className="modal-actions">

            <button
              type="button"
              className="btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
            >
              Create
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}