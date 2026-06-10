import api from "../utils/axios";
export const getCoursesApi    = ()         => api.get("/api/courses");
export const createCourseApi  = (data)     => api.post("/api/courses", data);
export const updateCourseApi  = (id, data) => api.put(`/api/courses/${id}`, data);
export const deleteCourseApi  = (id)       => api.delete(`/api/courses/${id}`);