import React, { useEffect, useState, useRef } from 'react';
import { workspaceApi } from '../api/workspaceApi';

const ChatWindow = ({ channel, currentUser, socket }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const endRef = useRef(null);

    // --- 1. LOAD MESSAGES & SOCKET SETUP ---
    useEffect(() => {
        if (!channel?._id) return;

        setLoading(true);
        // Clear previous messages immediately on switch
        setMessages([]);
        setSelectedFile(null); // Clear pending file on switch
        setPreviewUrl(null);

        // Emit "join-room" -> Server will fetch history and emit "load-messages"
        socket.emit('join-room', channel._id);

        const onLoadMessages = (loadedMessages) => {
            setMessages(loadedMessages);
            setLoading(false);
        };

        const onReceiveMessage = (msg) => {
            // Strictly check room/channel match
            if (msg.channelId === channel._id) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        const onMessageDeleted = (messageId) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        };

        socket.on('load-messages', onLoadMessages);
        socket.on('receive-message', onReceiveMessage);
        socket.on('message_deleted', onMessageDeleted);

        return () => {
            socket.off('load-messages', onLoadMessages);
            socket.off('receive-message', onReceiveMessage);
            socket.off('message_deleted', onMessageDeleted);
        };
    }, [channel?._id, socket]);

    // Auto-scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);


    // --- 3. SEND & DELETE MESSAGE (SOCKET FLOW) ---
    const handleSend = async (e) => {
        e.preventDefault();

        // Validation: Must have text OR file
        if ((!inputText.trim() && !selectedFile) || !channel?._id) return;

        let attachments = [];

        // 1. Upload File if present
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const res = await workspaceApi.uploadFile(formData);

                attachments.push({
                    url: res.data.url,
                    name: res.data.name,
                    type: res.data.type,
                    size: res.data.size
                });
            } catch (err) {
                console.error("File upload failed:", err);
                alert("Failed to upload file. Message not sent.");
                return;
            }
        }

        // 2. Emit "send-message"
        socket.emit('send-message', {
            room: channel._id,
            user: currentUser,
            text: inputText,
            attachments: attachments
        });

        // 3. Reset Input State
        setInputText('');
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleDeleteMessage = (messageId) => {
        if (window.confirm("Delete this message?")) {
            socket.emit('delete_message', {
                channelId: channel._id,
                messageId
            });
        }
    };


    // --- 4. RENDER ---

    if (!channel) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#313338] text-[#949ba4]">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">No Channel Selected</h3>
                    <p>Select a channel from the sidebar to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#313338] min-w-0 font-sans relative">
            {/* HEADER */}
            <div className="h-12 border-b border-[#26272D] flex items-center px-4 shrink-0 shadow-sm z-10 bg-[#313338]">
                <span className="text-[#80848e] text-2xl mr-2 font-light">#</span>
                <span className="font-bold text-white truncate tracking-wide">{channel.name}</span>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col space-y-4">
                {loading ? (
                    <div className="mt-auto text-center text-[#949ba4] pb-4 animate-pulse">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="mt-auto mb-6 px-4">
                        <div className="w-16 h-16 bg-[#41434a] rounded-[24px] flex items-center justify-center mb-4 text-white shadow-lg">
                            <span className="text-4xl font-light">#</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{channel.name}!</h1>
                        <p className="text-[#b5bac1] text-lg">This is the start of the #{channel.name} channel.</p>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <div
                            key={m._id || idx}
                            className="group flex gap-4 pr-4 hover:bg-[#2e3035]/30 -mx-4 px-4 py-1 transition-colors relative"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[#5865f2] shrink-0 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-[#313338] mt-0.5">
                                {m.senderName ? m.senderName[0].toUpperCase() : '?'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium hover:underline cursor-pointer">
                                        {m.senderName}
                                    </span>
                                    <span className="text-[11px] text-[#949ba4] font-medium opacity-80">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Message Content */}
                                {m.content && (
                                    <div className="text-[#dbdee1] whitespace-pre-wrap break-words leading-relaxed bg-[#383a40] inline-block px-3 py-2 rounded-[10px] rounded-tl-none shadow-sm max-w-full">
                                        {m.content}
                                    </div>
                                )}

                                {/* Attachments */}
                                {m.attachments && m.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-col gap-2">
                                        {m.attachments.map((att, i) => (
                                            <div key={i}>
                                                {att.type && att.type.startsWith('image/') ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_SOCKET_URL}${att.url}`}
                                                        alt={att.name}
                                                        className="max-w-sm max-h-60 rounded-lg object-contain bg-black/20"
                                                    />
                                                ) : (
                                                    <a
                                                        href={`${import.meta.env.VITE_SOCKET_URL}${att.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-[#2b2d31] p-3 rounded border border-gray-700 max-w-sm hover:bg-[#313338] transition-colors"
                                                    >
                                                        <span className="text-2xl">📄</span>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-blue-400 font-medium truncate underline">{att.name}</span>
                                                            <span className="text-xs text-gray-500">{Math.round(att.size / 1024)} KB</span>
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Delete Button (Visible on Hover) */}
                            {(currentUser._id === m.senderId || currentUser._id === m.userId) && (
                                <button
                                    onClick={() => handleDeleteMessage(m._id)}
                                    className="hidden group-hover:flex absolute -top-2 right-4 w-8 h-8 items-center justify-center bg-[#313338] border border-[#26272D] rounded shadow-md text-gray-400 hover:text-red-500 hover:scale-105 transition-all z-10"
                                    title="Delete Message"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>

            {/* INPUT AREA */}
            <div className="px-4 pb-6 pt-2 bg-[#313338] shrink-0">
                {/* File Preview Area */}
                {selectedFile && (
                    <div className="flex items-center gap-2 mb-2 bg-[#2b2d31] p-2 rounded-lg w-fit border border-[#383a40]">
                        <div className="relative">
                            {selectedFile.type.startsWith('image/') ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded bg-black/20"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-[#383a40] rounded">
                                    <span className="text-2xl">📄</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                            <span className="text-sm text-gray-200 truncate font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}
                            className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSend}
                    className="bg-[#383a40] rounded-xl px-4 py-2.5 flex items-center shadow-md border border-transparent focus-within:border-[#5865f2] transition-colors"
                >
                    <input
                        type="file"
                        hidden
                        ref={(el) => { if (el) window.fileInput = el; }}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            // Set state instead of immediate upload
                            setSelectedFile(file);

                            // Generate preview URL
                            if (file.type.startsWith('image/')) {
                                setPreviewUrl(URL.createObjectURL(file));
                            } else {
                                setPreviewUrl(null);
                            }

                            // Clear value to allow re-selecting same file if cleared
                            e.target.value = null;
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => window.fileInput && window.fileInput.click()}
                        className="w-6 h-6 text-[#b5bac1] hover:text-[#dbdee1] rounded-full flex items-center justify-center mr-3 transition-transform hover:rotate-90"
                    >
                        <span className="text-2xl leading-none font-light">+</span>
                    </button>

                    <input
                        className="flex-1 bg-transparent border-none outline-none text-[#dbdee1] placeholder-[#949ba4] h-6 font-medium"
                        placeholder={`Message #${channel.name}`}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        autoFocus
                    />

                    {(inputText.trim() || selectedFile) && (
                        <button
                            type="submit"
                            className="ml-3 text-[#5865f2] hover:text-white hover:bg-[#5865f2] px-2 py-1 rounded transition-all text-xs font-bold uppercase tracking-wide"
                        >
                            Send
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
