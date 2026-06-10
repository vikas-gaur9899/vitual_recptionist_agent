import { useEffect, useState } from "react";
import { getCoursesApi, deleteCourseApi } from "../api/course.api";
import CreateCourseModal from "../modals/CreateCourseModal";
import EditCourseModal from "../modals/EditCourseModal";
import toast from "react-hot-toast";

export default function Courses() {

  const [courses,       setCourses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [openCreate,    setOpenCreate]    = useState(false);
  const [openEdit,      setOpenEdit]      = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await getCoursesApi();
      setCourses(res.data.data || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete course?")) return;
    try {
      await deleteCourseApi(id);
      toast.success("Course deleted");
      fetchCourses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setOpenEdit(true);
  };

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Courses</h2>
        <button className="btn btn-primary" onClick={() => setOpenCreate(true)}>
          Create Course
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
                  <th>Duration</th>
                  <th>Fees</th>
                  <th>EMI</th>
                  <th>Placement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>

                {courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">No courses found</td>
                  </tr>
                )}

                {courses.map(course => (
                  <tr key={course._id}>
                    <td style={{ fontWeight: 500 }}>{course.name}</td>
                    <td>{course.duration}</td>
                    <td>₹{course.fees}</td>
                    <td>{course.emi || "—"}</td>
                    <td>{course.placement || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>

                        {/* ✅ EDIT BUTTON */}
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEdit(course)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm"
                          style={{ color: "var(--red)" }}
                          onClick={() => handleDelete(course._id)}
                        >
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

      {/* Create Modal */}
      <CreateCourseModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchCourses}
      />

      {/* Edit Modal ✅ */}
      <EditCourseModal
        open={openEdit}
        course={selectedCourse}
        onClose={() => { setOpenEdit(false); setSelectedCourse(null); }}
        onSuccess={fetchCourses}
      />

    </div>
  );
}