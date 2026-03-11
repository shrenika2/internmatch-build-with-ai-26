import React, { useState, useEffect } from 'react';
import MessageInput from './MessageInput'; // Reuse existing input
import { workspaceApi } from '../api/workspaceApi';

const ThreadPanel = ({ parentMessage, onClose, socket, currentUser }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!parentMessage) return;
        
        // Initial Fetch (Mock for now or API if implemented)
        // socket join handled by parent workspace? Or emit here?
        socket.emit('join_thread', parentMessage._id);

        const onThreadMessage = (msg) => {
            if (msg.parentMessageId === parentMessage._id) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('thread_message', onThreadMessage);
        
        return () => {
            socket.off('thread_message', onThreadMessage);
            socket.emit('leave_thread', parentMessage._id);
        };
    }, [parentMessage, socket]);

    const handleSend = (text) => {
        socket.emit('send_message', {
            channelId: parentMessage.channelId,
            text,
            sender: currentUser,
            parentMessageId: parentMessage._id
        });
    };

    return (
        <div className="w-[350px] bg-[#2b2d31] border-l border-[#1f2023] flex flex-col h-full shadow-2xl">
            <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4">
                <span className="font-bold text-white">Thread</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-4 border-b border-[#1f2023] bg-[#313338]">
                <div className="flex items-center mb-2">
                    <span className="font-bold text-white text-sm mr-2">{parentMessage.senderName}</span>
                    <span className="text-gray-400 text-xs">Origin</span>
                </div>
                <div className="text-gray-300 text-sm">{parentMessage.text}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className="flex gap-3 mb-4">
                         <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                             {m.senderName[0]}
                         </div>
                         <div>
                             <div className="flex items-baseline mb-1">
                                 <b className="text-white text-sm mr-2">{m.senderName}</b>
                                 <span className="text-[10px] text-gray-500">
                                     {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                 </span>
                             </div>
                             <div className="text-[#dbdee1] text-sm">{m.text}</div>
                         </div>
                    </div>
                ))}
            </div>
            
            <div className="p-4 bg-[#313338]">
                <MessageInput onSendMessage={handleSend} placeholder="Reply to thread..." />
            </div>
        </div>
    );
};

export default ThreadPanel;
