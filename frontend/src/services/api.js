import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

export default api;
