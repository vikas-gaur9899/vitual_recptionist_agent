import api from "../utils/axios";
export const getAnalyticsApi = () => api.get("/api/analytics");