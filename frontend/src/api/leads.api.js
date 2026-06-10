import api from "../utils/axios";
export const getLeadsApi    = (params)   => api.get("/api/leads", { params });
export const getLeadByIdApi = (id)       => api.get(`/api/leads/${id}`);
export const updateLeadApi  = (id, data) => api.put(`/api/leads/${id}`, data);
export const deleteLeadApi  = (id)       => api.delete(`/api/leads/${id}`);