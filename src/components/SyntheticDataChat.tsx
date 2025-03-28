'use client';

import { useSyntheticDataStore } from '@/store/syntheticDataStore';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export default function SyntheticDataChat() {
    const [prompt, setPrompt] = useState('');
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const { messages, isLoading, sendPrompt, clearMessages } = useSyntheticDataStore();
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [outputFormat, setOutputFormat] = useState<'CSV' | 'XML' | 'JSON' | 'TEXT'>('CSV');

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
        setHasStartedChat(true);
    };

    const outputFormats = [
        { label: 'CSV', value: 'csv' },
        { label: 'XML', value: 'xml' },
        { label: 'JSON', value: 'json' },
        { label: 'TEXT', value: 'text' }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <div className={`flex flex-col flex-grow justify-center items-center transition-all duration-500 ${hasStartedChat ? 'pt-10' : 'justify-center'}`}>
                {!hasStartedChat && (
                    <>
                        <h1 className="text-4xl font-bold mb-8">Synthetic Data Engine</h1>
                        {/* Add format buttons to initial view */}
                        <div className="flex justify-center space-x-2 mb-8">
                            {outputFormats.map((format) => (
                                <button
                                    key={format.value}
                                    onClick={() => setOutputFormat(format.value as any)}
                                    className={`px-4 py-2 rounded-full text-sm 
                                ${outputFormat === format.value
                                            ? 'bg-blue-600/20 text-blue-300'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
                                >
                                    {format.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div className={`w-full max-w-4xl mx-auto px-4 ${hasStartedChat ? 'mt-auto mb-4' : ''}`}>
                    {/* Chat Messages Area */}
                    <div className={`space-y-4 ${hasStartedChat ? 'h-[calc(100vh-200px)] overflow-y-auto' : 'hidden'}`}>
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-3 rounded-lg max-w-xl 
                    ${message.type === 'user' ? 'bg-blue-600/20 text-blue-300 self-end ml-auto' :
                                            message.type === 'result' ? 'bg-gray-800' :
                                                'bg-red-600/20 text-red-300'}`}
                                >
                                    {message.content}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="relative w-full">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What do you want to explore?"
                            className="w-full p-4 bg-gray-800 rounded-lg text-white 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 
                bg-blue-600 text-white p-2 rounded-full 
                hover:bg-blue-700 disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>

                    {/* Output Format Selector */}
                    {hasStartedChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center space-x-2 mt-4"
                        >
                            {outputFormats.map((format) => (
                                <button
                                    key={format.value}
                                    onClick={() => setOutputFormat(format.value as any)}
                                    className={`px-4 py-2 rounded-full text-sm 
                    ${outputFormat === format.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {format.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}