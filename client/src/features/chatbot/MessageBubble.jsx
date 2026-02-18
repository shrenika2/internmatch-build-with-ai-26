import React from 'react';

/**
 * Component for displaying an individual chat message.
 */
const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                {/* Role Label */}
                <div className={`text-[10px] font-bold uppercase mb-1 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                    {isUser ? 'You' : 'Saarthi'}
                </div>

                {/* Message Content */}
                <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                </div>

                {/* Timestamp */}
                <div className={`text-[10px] mt-1 text-right opacity-60`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
