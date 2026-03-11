import React, { useState } from 'react';

const ChannelList = ({ channels, currentChannelId, onSelectChannel, onJoinChannel, onDeleteChannel, isAdmin }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    const handleSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newChannelName.trim()) {
                onJoinChannel(newChannelName.trim());
                setNewChannelName('');
                setIsCreating(false);
            }
        }
    };

    return (
        <div className="w-[240px] bg-gradient-to-b from-[#1e1f22] to-[#2b2d31] flex flex-col shrink-0 font-sans">
            {/* Header */}
            <div className="h-12 border-b border-[#1f2023] flex items-center px-4 font-bold text-white shadow-sm hover:bg-[#35373c]/50 transition-colors cursor-pointer truncate tracking-wide">
                Community Server
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                <div className="flex items-center justify-between px-2 mb-2 group text-[#949ba4] hover:text-[#dbdee1] transition-colors">
                    <span className="text-xs font-bold uppercase tracking-wider">Text Channels</span>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsCreating(!isCreating)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#3a3c43] hover:text-white transition-all shadow-sm"
                            title="Create Channel"
                        >
                            <span className="text-lg leading-none font-light">+</span>
                        </button>
                    )}
                </div>

                {isCreating && (
                    <div className="px-2 mb-2">
                        <input 
                            autoFocus
                            className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm px-2 py-1.5 rounded-md border border-[#5865f2] outline-none shadow-sm transition-all"
                            placeholder="new-channel"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            onKeyDown={handleSubmit}
                            onBlur={() => { if(!newChannelName) setIsCreating(false); }}
                        />
                    </div>
                )}

                <div className="space-y-[4px]">
                    {channels.map(channel => (
                        <div 
                            key={channel._id}
                            onClick={() => onSelectChannel(channel)}
                            className={`
                                group relative px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all duration-200 ease-in-out
                                ${currentChannelId === channel._id 
                                    ? 'bg-[#404249] text-white shadow-md' 
                                    : 'text-[#949ba4] hover:bg-[#3a3c43] hover:text-[#dbdee1]'}
                            `}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className="text-xl leading-none text-[#80848e] opacity-80">#</span>
                                <span className={`font-medium truncate ${currentChannelId === channel._id ? 'text-white' : ''}`}>
                                    {channel.name}
                                </span>
                            </div>
                            
                            {isAdmin && (
                                <button 
                                    className="hidden group-hover:flex w-5 h-5 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#2b2d31] transition-all"
                                    onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel._id); }}
                                    title="Delete Channel"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {channels.length === 0 && !isCreating && (
                        <div className="text-xs text-center text-gray-500 py-6 italic opacity-70">
                            No channels yet
                        </div>
                    )}
                </div>
            </div>
            
            {/* User Bar */}
            <div className="h-[52px] bg-[#232428]/95 px-2 flex items-center shrink-0 shadow-[0_-1px_0_0_#1e1f22]">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2 shadow-sm ring-2 ring-[#1e1f22]">
                    U
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate leading-tight">User Demo</div>
                    <div className="text-xs text-[#949ba4] truncate leading-tight hover:underline cursor-pointer">#1234</div>
                </div>
            </div>
        </div>
    );
};

export default ChannelList;
