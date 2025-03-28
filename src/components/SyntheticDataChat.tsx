'use client';

import { useSyntheticDataStore } from '@/store/syntheticDataStore';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export default function SyntheticDataChat() {
    const [prompt, setPrompt] = useState('');
    const { messages, isLoading, sendPrompt, clearMessages } = useSyntheticDataStore();
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() === '') return;

        sendPrompt(prompt);
        setPrompt('');
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
            {/* Chat Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-3 rounded-lg max-w-xl 
                ${message.type === 'user' ? 'bg-blue-100 self-end ml-auto' :
                                    message.type === 'result' ? 'bg-green-100' :
                                        'bg-red-100'}`}
                        >
                            {message.content}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="p-4 text-center text-gray-500">
                    Generating synthetic data...
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-gray-100 flex">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the synthetic data you want to generate..."
                    className="flex-grow p-2 border rounded-l-lg"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white p-2 rounded-r-lg 
            hover:bg-blue-600 disabled:opacity-50"
                >
                    Generate
                </button>
            </form>
        </div>
    );
}