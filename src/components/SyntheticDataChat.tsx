'use client';

import { useSyntheticDataStore } from '@/store/syntheticDataStore';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export default function SyntheticDataChat() {
    const [prompt, setPrompt] = useState('');
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const { messages, isLoading, sendPrompt, sendFileWithPrompt, clearMessages } = useSyntheticDataStore();
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [outputFormat, setOutputFormat] = useState<'CSV' | 'XML' | 'JSON' | 'TEXT'>('CSV');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isLLMSelectorOpen, setIsLLMSelectorOpen] = useState(false);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // LLM selection state
    const [selectedLLM, setSelectedLLM] = useState<{
        id: string;
        name: string;
        description: string;
        icon: React.ReactNode;
    }>({
        id: 'claude-2.1',
        name: 'Claude 2.1',
        description: 'anthropic.claude-v2:1',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
        )
    });

    // Available LLM options
    const llmOptions = [
        {
            id: 'claude-2.1',
            name: 'Claude 2.1',
            description: 'anthropic.claude-v2:1',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            )
        },
        {
            id: 'llama-3',
            name: 'Llama 3',
            description: 'llama3-8b-8192',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
            )
        }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close LLM selector if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isLLMSelectorOpen && !target.closest('.llm-selector-container')) {
                setIsLLMSelectorOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLLMSelectorOpen]);

    // Reset file input when selectedFile changes to null
    useEffect(() => {
        if (selectedFile === null && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedFile]);

    const resetFileInput = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() === '' && !selectedFile) return;

        try {
            if (selectedFile) {
                await sendFileWithPrompt(prompt, selectedFile, outputFormat.toLowerCase(), selectedLLM.id);
            } else {
                await sendPrompt(prompt, outputFormat.toLowerCase(), selectedLLM.id);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            // Always reset regardless of success or failure
            resetFileInput();
            setPrompt('');
            setHasStartedChat(true);
        }
    };

    const handleUploadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isLoading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            // Check if the file is a CSV
            if (!file.name.toLowerCase().endsWith('.csv')) {
                setFileError('Only CSV files are allowed');
                resetFileInput();
                // Clear the error message after 3 seconds
                setTimeout(() => setFileError(null), 3000);
                return;
            }
            setFileError(null);
        }

        setSelectedFile(file);
    };

    const handleRemoveFile = () => {
        resetFileInput();
    };

    const toggleLLMSelector = () => {
        setIsLLMSelectorOpen(!isLLMSelectorOpen);
    };

    const handleSelectLLM = (llm: typeof selectedLLM) => {
        setSelectedLLM(llm);
        setIsLLMSelectorOpen(false);
    };

    const outputFormats = [
        { label: 'CSV', value: 'CSV' },
        { label: 'XML', value: 'XML' },
        { label: 'JSON', value: 'JSON' },
        { label: 'TEXT', value: 'TEXT' }
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

                    {/* Input Area and Controls Container */}
                    <div
                        ref={inputContainerRef}
                        className={`relative w-full ${isFocused ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => {
                            // Only blur if the related target is outside the container
                            if (!inputContainerRef.current?.contains(e.relatedTarget as Node)) {
                                setIsFocused(false);
                            }
                        }}
                    >
                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="relative w-full">
                            <input
                                type="text"
                                value={selectedFile ? 'Data will be generated based on the uploaded file.' : prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="What do you want to generate?"
                                disabled={!!selectedFile}
                                className={`w-full p-4 rounded-t-lg focus:outline-none
                                    placeholder-gray-500
                                    ${selectedFile
                                        ? 'bg-gray-800 cursor-not-allowed text-gray-400'
                                        : 'bg-gray-800 text-white '}`}
                            />

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* File error message */}
                            {fileError && (
                                <div className="absolute left-4 bottom-14 bg-red-600/20 text-red-300 py-1 px-3 rounded-full text-sm">
                                    {fileError}
                                </div>
                            )}

                            {/* Selected file indicator for both initial view and after chat started */}
                            {selectedFile && (
                                <div className={`flex items-center space-x-2 bg-gray-800 py-1 px-3 rounded-full text-sm ring-2 ring-blue-300
                                ${hasStartedChat
                                        ? 'absolute -top-7 left-0'
                                        : 'absolute left-4 bottom-14'
                                    }`}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-blue-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <span className="truncate max-w-xs">{selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Buttons container */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                {/* Upload button */}
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    disabled={isLoading}
                                    className={`bg-gray-800 text-white p-2 rounded-full 
                                        hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                                        ${selectedFile ? 'ring-2 ring-blue-300' : ''}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5m0 0l5 5m-5-5v12"
                                        />
                                    </svg>
                                </button>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600/70 text-white p-2 rounded-full 
                                        hover:bg-blue-700/70 disabled:opacity-50
                                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {isLoading ? (
                                        // Spinner animation when loading
                                        <svg
                                            className="animate-spin h-6 w-6 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-100"
                                                fill="white"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        // Default submit icon when not loading
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* LLM Selector - Now with the same background as the input */}
                        <div className="relative llm-selector-container bg-gray-800 rounded-b-lg border-t border-gray-600">
                            {/* Command Bar with Format selector and LLM selector */}
                            <div className="flex items-center px-4 py-2 justify-between">
                                {/* Format Selector with slide-out animation */}
                                <div className="relative group">
                                    {/* Format Selector Button (showing selected format) */}
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded-full text-sm transition-colors"
                                    >
                                        <span className="text-white">{outputFormat}</span>
                                    </button>

                                    {/* Sliding format options that appear on hover */}
                                    <div className="absolute left-0 top-0 flex overflow-hidden w-0 group-hover:w-64 transition-all duration-300 ease-in-out">
                                        <div className="flex space-x-1 bg-gray-700 pl-1 pr-2 py-1 rounded-full">
                                            {outputFormats.map((format) => (
                                                <button
                                                    key={format.value}
                                                    onClick={() => setOutputFormat(format.label as any)}
                                                    className={`px-2 py-0.5 rounded-full text-sm whitespace-nowrap transition-colors
                                ${outputFormat === format.label ? 'bg-blue-700/70 text-blue-300' : 'text-gray-300 hover:bg-gray-600'}`}
                                                >
                                                    {format.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* LLM Selector badge/bubble button */}
                                    <button
                                        type="button"
                                        onClick={toggleLLMSelector}
                                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded-full text-sm transition-colors"
                                    >
                                        <div className="text-blue-300">
                                            {selectedLLM.icon}
                                        </div>
                                        <span className="text-white">{selectedLLM.name}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-4 w-4 text-gray-400 transition-transform ${isLLMSelectorOpen ? 'rotate-180' : ''}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Optional: Add model description next to the button */}
                                    <span className="text-gray-400 text-xs hidden sm:inline-block">{selectedLLM.description}</span>
                                </div>
                            </div>

                            {/* Square Card Menu for LLM options */}
                            {isLLMSelectorOpen && (
                                <div className="absolute bottom-full left-4 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 w-64">
                                    <div className="p-2">
                                        {llmOptions.map((llm) => (
                                            <button
                                                key={llm.id}
                                                onClick={() => handleSelectLLM(llm)}
                                                className={`flex items-center w-full px-3 py-3 text-left rounded-md transition-colors mb-1 last:mb-0
                            ${selectedLLM.id === llm.id ? 'bg-gray-700 ring-1 ring-blue-500' : 'hover:bg-gray-700'}`}
                                            >
                                                <div className="text-blue-300 mr-3">
                                                    {llm.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-white">{llm.name}</div>
                                                    <div className="text-gray-400 text-xs">{llm.description}</div>
                                                </div>
                                                {selectedLLM.id === llm.id && (
                                                    <div className="ml-auto text-blue-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}