import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

/**
 * Scrollable container for chat messages.
 * Automatically scrolls to bottom when new messages arrive.
 */
const ChatWindow = ({ messages, isLoading, error }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom whenever messages or loading state changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth"
            style={{ minHeight: '300px', maxHeight: '500px' }}
        >
            {/* Welcome Message if no history */}
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <p className="text-sm">Hi! I'm Saarthi, your career assistant.</p>
                    <p className="text-xs mt-1">Ask me about resumes, internships, or interview tips.</p>
                </div>
            )}

            {/* List of messages */}
            {messages.map((msg, index) => (
                <MessageBubble key={msg.id || index} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-start mb-4">
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 rounded-bl-none">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-.1s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100 text-center">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
