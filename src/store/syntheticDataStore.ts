import { generateSyntheticData } from '@/lib/api';
import { create } from 'zustand';

// Types for our store
export interface Message {
    id: string;
    content: string;
    type: 'user' | 'system' | 'result';
    timestamp: Date;
}

export interface SyntheticDataState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;

    // Actions
    sendPrompt: (prompt: string) => Promise<void>;
    clearMessages: () => void;
}

export const useSyntheticDataStore = create<SyntheticDataState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    sendPrompt: async (prompt: string) => {
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
            const response = await generateSyntheticData(prompt);

            const resultMessage: Message = {
                id: `result-${Date.now()}`,
                content: JSON.stringify(response.data, null, 2),
                type: 'result',
                timestamp: new Date()
            };

            set(state => ({
                messages: [...state.messages, resultMessage],
                isLoading: false
            }));
        } catch (error: any) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                content: error.message || 'An unexpected error occurred',
                type: 'system',
                timestamp: new Date()
            };

            set({
                messages: [...get().messages, errorMessage],
                isLoading: false,
                error: error.message
            });
        }
    },

    clearMessages: () => {
        set({ messages: [], error: null });
    }
}));