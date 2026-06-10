import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

/**
 * Get Settings
 */
export const getSettings = async () => {

    const response = await API.get(
        "/api/settings"
    );

    return response.data;
};

/**
 * Update Settings
 */
export const updateSettings = async (data) => {

    const response = await API.put(
        "/api/settings",
        data
    );

    return response.data;
};

/**
 * Update Profile
 */
export const updateProfile = async (data) => {

    const response = await API.put(
        "/api/settings/profile",
        data
    );

    return response.data;
};

/**
 * Change Password
 */
export const changePassword = async (data) => {

    const response = await API.put(
        "/api/settings/change-password",
        data
    );

    return response.data;
};