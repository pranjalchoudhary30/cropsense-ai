import axios from 'axios';

// UPDATE THIS to your machine's WiFi IP (run ipconfig, look for IPv4)
const BASE_URL = 'http://10.17.120.160:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000, headers: { 'Content-Type': 'application/json' } });

export const loginUser = (email, password) => api.post('/api/auth/login', { email, password });
export const registerUser = (name, email, password) => api.post('/api/auth/register', { name, email, password });
export const predictPrice = (crop, location) => api.post('/api/predict', { crop, location });
export const getWeather = (location) => api.get(`/api/weather?location=${encodeURIComponent(location)}`);
export const getSpoilageRisk = (crop, location) => api.post('/api/spoilage', { crop, location });
export const recommendMarket = (crop, location) => api.post('/api/market', { crop, location });

export default api;
