import React, { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const ReactionBar = ({ onReact }) => {
    return (
        <div className="flex bg-[#2b2d31] rounded-lg shadow-lg border border-[#1f2023] p-1 gap-1">
            {EMOJIS.map(emoji => (
                <button 
                    key={emoji} 
                    onClick={() => onReact(emoji)}
                    className="w-8 h-8 hover:bg-[#404249] rounded transition-colors flex items-center justify-center text-lg"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionBar;
