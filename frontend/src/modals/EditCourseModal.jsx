import { useState, useEffect } from "react";
import { updateCourseApi } from "../api/course.api";
import toast from "react-hot-toast";

export default function EditCourseModal({ open, onClose, onSuccess, course }) {

  const [form, setForm] = useState({
    name: "",
    duration: "",
    fees: "",
    emi: "",
    syllabus: "",
    projects: "",
    placement: ""
  });

  // course change hone pe form prefill karo
  useEffect(() => {
    if (course) {
      setForm({
        name:      course.name      || "",
        duration:  course.duration  || "",
        fees:      course.fees      || "",
        emi:       course.emi       || "",
        syllabus:  course.syllabus  || "",
        projects:  course.projects  || "",
        placement: course.placement || ""
      });
    }
  }, [course]);

  if (!open || !course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCourseApi(course._id, form);
      toast.success("Course updated");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update course");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Edit Course</h3>
          <span
            style={{ cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }}
            onClick={onClose}
          >✕</span>
        </div>

        <form onSubmit={handleSubmit}>

          <input
            className="input"
            placeholder="Course Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            className="input"
            placeholder="Duration (e.g. 6 months)"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}
            required
          />

          <input
            className="input"
            placeholder="Fees (₹)"
            type="number"
            value={form.fees}
            onChange={e => setForm({ ...form, fees: e.target.value })}
            required
          />

          <input
            className="input"
            placeholder="EMI options"
            value={form.emi}
            onChange={e => setForm({ ...form, emi: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Syllabus"
            rows={3}
            value={form.syllabus}
            onChange={e => setForm({ ...form, syllabus: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Projects"
            rows={2}
            value={form.projects}
            onChange={e => setForm({ ...form, projects: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Placement info"
            rows={2}
            value={form.placement}
            onChange={e => setForm({ ...form, placement: e.target.value })}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary">Update</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
          </div>

        </form>

      </div>
    </div>
  );
}