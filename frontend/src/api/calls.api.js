import api from "../utils/axios";
export const getCallsApi    = (params) => api.get("/api/calls", { params });
export const getCallByIdApi = (id)     => api.get(`/api/calls/${id}`);