import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

/**
 * Attach JWT Token
 */
API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

/**
 * Create Admin
 */
export const createAdmin = async (data) => {

    const response = await API.post(
        "/api/users/admin",
        data
    );

    return response.data;
};

/**
 * Create Executive
 */
export const createExecutive = async (data) => {

    const response = await API.post(
        "/api/users/executive",
        data
    );

    return response.data;
};

/**
 * Get All Users
 */
export const getUsers = async () => {

    const response = await API.get(
        "/api/users"
    );

    return response.data;
};

/**
 * Enable User
 */
export const enableUser = async (id) => {

    const response = await API.put(
        `/api/users/${id}/enable`
    );

    return response.data;
};

/**
 * Disable User
 */
export const disableUser = async (id) => {

    const response = await API.put(
        `/api/users/${id}/disable`
    );

    return response.data;
};

/**
 * Delete User
 */
export const deleteUser = async (id) => {

    const response = await API.delete(
        `/api/users/${id}`
    );

    return response.data;
};

/**
 * Executive Performance
 */
export const getExecutivePerformance =
async (id) => {

    const response = await API.get(
        `/api/users/executive-performance/${id}`
    );

    return response.data;
};

/**
 * Update Profile
 */
export const updateProfile =
async (data) => {

    const response = await API.put(
        "/api/users/profile",
        data
    );

    return response.data;
};

/**
 * Change Password
 */
export const changePassword =
async (data) => {

    const response = await API.put(
        "/api/users/change-password",
        data
    );

    return response.data;
};