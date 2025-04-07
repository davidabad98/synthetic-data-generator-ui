import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 180000, // 3 minutes
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

export const generateSyntheticData = async (
    prompt: string,
    outputFormat: string = 'csv',
    selectedModel: string = 'claude-2.1'
) => {
    try {
        const payload: any = {
            output_format: outputFormat,
            prompt: prompt,
            volume: 10,
            parameters: { selectedModel: selectedModel }
        };

        const response = await api.post('/api/generate', payload);
        return response.data;
    } catch (error) {
        console.error('Error generating synthetic data:', error);
        throw error;
    }
};

export const uploadFile = async (file: File, selectedModel: string = 'claude-2.1') => {
    try {
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('selectedModel', selectedModel);
        // Create a custom config for the multipart/form-data
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        // Use the same axios instance but override the headers just for this request
        const response = await api.post('/api/upload', formData, config);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export default api;