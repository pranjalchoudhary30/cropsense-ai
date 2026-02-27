import axios from 'axios';

// Use environment variable for the backend URL, falling back to local IP for Android dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.17.120.160:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const checkHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

// --- Authentication Endpoints ---

export const loginUser = async (email, password) => {
    // OAuth2 password request form expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username' field
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const googleAuthLogin = async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
};

// --- Protected Endpoints ---

export const predictPrice = async (crop, location) => {
    const response = await api.post('/predict-price/', { crop, location });
    return response.data;
};

export const getWeather = async (location) => {
    const response = await api.get(`/weather/?location=${location}`);
    return response.data;
};

export const recommendMarket = async (crop, location) => {
    const response = await api.post('/recommend-market/', { crop, location });
    return response.data;
};

export const getSpoilageRisk = async (data) => {
    const response = await api.post('/spoilage-risk/', data);
    return response.data;
};

// ── Disease Detection ─────────────────────────────────────────────────

/**
 * Detect disease from an uploaded leaf image.
 * @param {FormData} formData — must contain `file` (image) and optionally `crop_hint`
 */
export const detectDisease = async (formData) => {
    // Use the shared api instance — it already has Authorization header set by AuthContext
    const response = await api.post('/disease/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

/** Fetch detection history for the logged-in user (newest first). */
export const getDetectionHistory = async (limit = 20) => {
    const response = await api.get(`/disease/history?limit=${limit}`);
    return response.data;
};

export default api;
