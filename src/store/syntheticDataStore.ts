import { generateSyntheticData, uploadFile } from '@/lib/api';
import axios, { AxiosError } from 'axios';
import { create } from 'zustand';

// Types for our store
export interface Message {
    id: string;
    content: string;
    type: 'user' | 'system' | 'result';
    timestamp: Date;
    url?: string | null;  // Optional URL property
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
    sendPrompt: (prompt: string, outputFormat: string, selectedModel: string) => Promise<void>;
    sendFileWithPrompt: (prompt: string, file: File, outputFormat: string, selectedModel: string) => Promise<void>;
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

// Type guard to ensure we have the expected structure
function isValidResponse(data: any): data is { message: string; data: { message: string; url: string } } {
    return (
        typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        typeof data.data === 'object' &&
        data.data !== null &&
        'message' in data.data &&
        'url' in data.data &&
        typeof data.data.url === 'string'
    );
}

export const useSyntheticDataStore = create<SyntheticDataState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    sendPrompt: async (prompt: string, outputFormat: string = 'csv', selectedModel: string = 'claude-2.1') => {
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
            const response = await generateSyntheticData(prompt, outputFormat, selectedModel);

            let messageContent = '';
            let downloadUrl: string | undefined;

            // Process the response based on its structure
            if (isValidResponse(response)) {
                // We have the expected structure
                messageContent = response.data.message;
                downloadUrl = response.data.url;
            } else if (typeof response.data?.data === 'object' && response.data?.data?.message) {
                // Partial structure - has message but maybe not URL
                messageContent = response.data.data.message;
                downloadUrl = response.data.data.url;
            } else {
                // Fallback for unexpected formats
                messageContent = typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2);
                downloadUrl = undefined;
            }

            const resultMessage: Message = {
                id: `result-${Date.now()}`,
                content: messageContent,
                type: 'result',
                timestamp: new Date(),
                url: downloadUrl
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

    sendFileWithPrompt: async (prompt: string, file: File, outputFormat: string = 'csv', selectedModel: string = 'claude-2.1') => {
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
            const response = await uploadFile(file, selectedModel);

            // Code implementation for sending a prompt after the file is saved
            // Then send the prompt with the file reference
            // const response = await generateSyntheticData(
            //     prompt,
            //     outputFormat,
            //     fileUploadResponse.fileUrl || fileUploadResponse.fileKey
            // );

            const resultMessage: Message = {
                id: `result-${Date.now()}`,
                content: (
                    typeof response.data === 'object' &&
                    response.data !== null &&
                    'data' in response.data &&
                    typeof response.data.data === 'string'
                ) ? response.data.data :  // Extract nested data property
                    typeof response.data === 'string' ? response.data :  // Fallback to string
                        JSON.stringify(response.data, null, 2),  // Final fallback
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