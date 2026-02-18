import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { useChatbot } from './useChatbot';

/**
 * Main Chatbot Component.
 * Can be used as a standalone module or embedded in a sidebar.
 */
const Chatbot = () => {
    const [input, setInput] = useState('');
    const { messages, isLoading, error, sendMessage, clearChat } = useChatbot();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        setInput(''); // Clear input immediately for better UX
        await sendMessage(currentInput);
    };

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        S
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-none">Saarthi AI</h3>
                        <span className="text-[10px] text-blue-100 flex items-center mt-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                            Online Career Guide
                        </span>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                    title="Clear Chat History"
                >
                    Clear Chat
                </button>
            </div>

            {/* Chat Body */}
            <ChatWindow
                messages={messages}
                isLoading={isLoading}
                error={error}
            />

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Saarthi about internships, resumes..."
                        disabled={isLoading}
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-full transition-all ${!input.trim() || isLoading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-2">
                    Saarthi may occasionally provide incorrect info. Verify important dates.
                </p>
            </form>
        </div>
    );
};

export default Chatbot;
