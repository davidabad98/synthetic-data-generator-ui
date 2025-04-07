import { generateSyntheticData, uploadFile } from '@/lib/api';
import axios, { AxiosError } from 'axios';
import { create } from 'zustand';

// Types for our store
export interface Message {
    id: string;
    content: string;
    type: 'user' | 'system' | 'result';
    timestamp: Date;
}

// Type for API error response
interface ApiErrorResponse {
    detail?: Array<{
        msg: string;
        type: string;
        loc: string[];
    }>;
    message?: string;
}

export interface SyntheticDataState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;

    // Actions
    sendPrompt: (prompt: string, outputFormat: string) => Promise<void>;
    sendFileWithPrompt: (prompt: string, file: File, outputFormat: string) => Promise<void>;
    clearMessages: () => void;
}

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        // Handle validation errors (422)
        if (axiosError.response?.status === 422) {
            const rawMessage = axiosError.response.data.detail?.[0]?.msg;
            const cleanMessage = rawMessage?.replace(/^Value error, /i, '')?.trim();
            return cleanMessage || 'Invalid request format';
        }
        // Handle other API errors
        return axiosError.response?.data.message || axiosError.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

export const useSyntheticDataStore = create<SyntheticDataState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    sendPrompt: async (prompt: string, outputFormat: string = 'csv') => {
        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: prompt,
            type: 'user',
            timestamp: new Date()
        };

        set(state => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
            error: null
        }));

        try {
            // API call to synthetic data generator
            const response = await generateSyntheticData(prompt, outputFormat);

            const resultMessage: Message = {
                id: `result-${Date.now()}`,
                content: typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2),
                type: 'result',
                timestamp: new Date()
            };

            set(state => ({
                messages: [...state.messages, resultMessage],
                isLoading: false
            }));
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            const systemMessage: Message = {
                id: `error-${Date.now()}`,
                content: errorMessage,
                type: 'system',
                timestamp: new Date()
            };

            set(state => ({
                messages: [...state.messages, systemMessage],
                isLoading: false,
                error: errorMessage
            }));
        }
    },

    sendFileWithPrompt: async (prompt: string, file: File, outputFormat: string = 'csv') => {
        // Add user message including file information
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: prompt
                ? `${prompt} [File: ${file.name}]`
                : `File uploaded: ${file.name}`,
            type: 'user',
            timestamp: new Date()
        };

        set(state => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
            error: null
        }));

        try {
            // First upload the file and get its URL or reference
            const response = await uploadFile(file);

            // Code implementation for sending a prompt after the file is saved
            // Then send the prompt with the file reference
            // const response = await generateSyntheticData(
            //     prompt,
            //     outputFormat,
            //     fileUploadResponse.fileUrl || fileUploadResponse.fileKey
            // );

            const resultMessage: Message = {
                id: `result-${Date.now()}`,
                content: typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2),
                type: 'result',
                timestamp: new Date()
            };

            set(state => ({
                messages: [...state.messages, resultMessage],
                isLoading: false
            }));
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            const systemMessage: Message = {
                id: `error-${Date.now()}`,
                content: errorMessage,
                type: 'system',
                timestamp: new Date()
            };

            set(state => ({
                messages: [...state.messages, systemMessage],
                isLoading: false,
                error: errorMessage
            }));
        }
    },

    clearMessages: () => {
        set({ messages: [], error: null });
    }
}));