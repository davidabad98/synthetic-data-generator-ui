import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        // Optional: Add authentication token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Centralized error handling
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const generateSyntheticData = async (prompt: string) => {
    try {
        const response = await api.post('/api/generate', {
            output_format: 'csv',
            prompt: prompt,
            volume: 10,
            parameters: { country: 'US' }
        });
        return response.data;
    } catch (error) {
        console.error('Error generating synthetic data:', error);
        throw error;
    }
};

export default api;