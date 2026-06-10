import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Create Campaign
 */
export const createCampaign = async (data) => {
    const response = await API.post("/api/campaigns", data);
    return response.data;
};

// alias — Campaigns.jsx yahi call karta hai
export const createCampaignApi = createCampaign;

/**
 * Get Campaigns
 */
export const getCampaigns = async () => {
    const response = await API.get("/api/campaigns");
    return response.data;
};

// alias — Campaigns.jsx yahi call karta hai
export const getCampaignsApi = getCampaigns;

/**
 * Get Single Campaign
 */
export const getCampaign = async (id) => {
    const response = await API.get(`/api/campaigns/${id}`);
    return response.data;
};

/**
 * Start Campaign
 */
export const startCampaign = async (id) => {
    const response = await API.post(`/api/campaigns/start/${id}`);
    return response.data;
};

/**
 * Stop Campaign
 */
export const stopCampaign = async (id) => {
    const response = await API.post(`/api/campaigns/stop/${id}`);
    return response.data;
};

/**
 * Campaign Analytics
 */
export const getCampaignAnalytics = async (id) => {
    const response = await API.get(`/api/campaigns/analytics/${id}`);
    return response.data;
};