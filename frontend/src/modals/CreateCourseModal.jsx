import { useState } from "react";
import { createCourseApi } from "../api/course.api";
import toast from "react-hot-toast";

export default function CreateCourseModal({
  open,
  onClose,
  onSuccess
}) {

  const [form, setForm] = useState({

    name: "",
    duration: "",
    fees: "",
    emi: "",
    syllabus: "",
    projects: "",
    placement: ""

  });

  if (!open) return null;

  const handleSubmit = async e => {

    e.preventDefault();

    try {

      await createCourseApi(form);

      toast.success(
        "Course created"
      );

      onSuccess();

      onClose();

      setForm({

        name: "",
        duration: "",
        fees: "",
        emi: "",
        syllabus: "",
        projects: "",
        placement: ""

      });

    } catch {

      toast.error(
        "Failed to create course"
      );
    }
  };

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h3>
          Create Course
        </h3>

        <form onSubmit={handleSubmit}>

          <input
            className="input"
            placeholder="Course Name"
            value={form.name}
            onChange={e =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

          <input
            className="input"
            placeholder="Duration"
            value={form.duration}
            onChange={e =>
              setForm({
                ...form,
                duration: e.target.value
              })
            }
          />

          <input
            className="input"
            placeholder="Fees"
            value={form.fees}
            onChange={e =>
              setForm({
                ...form,
                fees: e.target.value
              })
            }
          />

          <input
            className="input"
            placeholder="EMI"
            value={form.emi}
            onChange={e =>
              setForm({
                ...form,
                emi: e.target.value
              })
            }
          />

          <textarea
            className="input"
            placeholder="Syllabus"
            value={form.syllabus}
            onChange={e =>
              setForm({
                ...form,
                syllabus: e.target.value
              })
            }
          />

          <textarea
            className="input"
            placeholder="Projects"
            value={form.projects}
            onChange={e =>
              setForm({
                ...form,
                projects: e.target.value
              })
            }
          />

          <textarea
            className="input"
            placeholder="Placement"
            value={form.placement}
            onChange={e =>
              setForm({
                ...form,
                placement: e.target.value
              })
            }
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16
            }}
          >

            <button
              className="btn btn-primary"
            >
              Save
            </button>

            <button
              type="button"
              className="btn"
              onClick={onClose}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}