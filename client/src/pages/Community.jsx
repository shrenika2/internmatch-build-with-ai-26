import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Send, Hash,
    Plus, Loader2, User as UserIcon, Briefcase, GraduationCap,
    ThumbsUp, Award, Search, Info, Flag
} from 'lucide-react';
import { io } from 'socket.io-client';

const Community = () => {
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [activeCommunity, setActiveCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomType, setNewRoomType] = useState('student-student');
    const scrollRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (user) {
            const socket = io('http://localhost:5000', {
                auth: { token: user.token }
            });
            socketRef.current = socket;

            socket.on('new_message', (message) => {
                setMessages(prev => {
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                // Automatic read receipt if message is for active room
                if (activeCommunity?._id === message.community) {
                    handleMarkAsRead(message._id);
                }
            });

            socket.on('message_read', ({ messageId, userId }) => {
                setMessages(prev => prev.map(m => {
                    if (m._id === messageId && !m.readBy?.some(r => r.user === userId)) {
                        return { ...m, readBy: [...(m.readBy || []), { user: userId }] };
                    }
                    return m;
                }));
            });

            return () => socket.disconnect();
        }
    }, [user, activeCommunity]);

    useEffect(() => {
        if (activeCommunity && socketRef.current) {
            socketRef.current.emit('join_room', activeCommunity._id);
            fetchMessages(activeCommunity._id);
            API.post(`/communities/${activeCommunity._id}/read`).catch(console.error);
            return () => socketRef.current.emit('leave_room', activeCommunity._id);
        }
    }, [activeCommunity]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleMarkAsRead = async (messageId) => {
        try {
            await API.post(`/communities/messages/${messageId}/read`);
        } catch (err) { }
    };

    const fetchCommunities = async () => {
        try {
            const { data } = await API.get('/communities/my');
            setCommunities(data);
            if (data.length > 0 && !activeCommunity) setActiveCommunity(data[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id) => {
        setMsgLoading(true);
        try {
            const { data } = await API.get(`/communities/${id}/messages`);
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setMsgLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeCommunity) return;
        try {
            const { data } = await API.post(`/communities/${activeCommunity._id}/message`, {
                content: newMessage,
                parentMessage: replyTo?._id
            });
            if (!messages.find(m => m._id === data._id)) {
                setMessages([...messages, data]);
            }
            setNewMessage('');
            setReplyTo(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReport = async (messageId) => {
        const reason = prompt('Reason for reporting this message?');
        if (!reason) return;
        try {
            await API.post('/communities/report', {
                targetType: 'message',
                targetId: messageId,
                reason
            });
            alert('Report submitted to admins.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleHelpful = async (messageId) => {
        try {
            const { data } = await API.post(`/communities/messages/${messageId}/helpful`);
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, helpfulBy: data.helpfulBy } : m));
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/communities', {
                name: newRoomName,
                type: newRoomType
            });
            setCommunities([...communities, data]);
            setActiveCommunity(data);
            setShowCreate(false);
            setNewRoomName('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create room');
        }
    };

    const isSenior = (sender) => {
        return sender.role === 'student' && sender.studentProfile?.year >= 3;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="h-screen pt-16 flex overflow-hidden bg-slate-950">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-slate-900/30 backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-500" />
                        <h2 className="text-xl font-bold text-white">Hubs</h2>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {communities.map((comm) => (
                        <button
                            key={comm._id}
                            onClick={() => setActiveCommunity(comm)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeCommunity?._id === comm._id ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-sm shrink-0">
                                {comm.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-bold truncate text-sm">{comm.name}</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-60">
                                    {comm.type.replace('-', ' ')}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col relative bg-slate-950/50">
                {activeCommunity ? (
                    <>
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/20 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <Hash className="w-6 h-6 text-primary-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{activeCommunity.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">{activeCommunity.type.split('-').join(' ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-6">
                            {msgLoading ? (
                                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" /></div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <p>Start a conversation...</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender._id === user?._id;
                                    const senior = isSenior(msg.sender);
                                    const helpfulCount = msg.helpfulBy?.length || 0;
                                    const isHelpfulByMe = msg.helpfulBy?.includes(user?._id);
                                    const readCount = msg.readBy?.length || 0;

                                    return (
                                        <div key={msg._id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0 flex items-center justify-center group relative cursor-help">
                                                <span className="font-bold text-slate-500">{msg.sender.name.charAt(0)}</span>
                                                {senior && <Award className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                            </div>
                                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${senior ? 'text-yellow-500' : 'text-slate-300'}`}>
                                                        {msg.sender.name}
                                                        {senior && ' (Senior)'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* parentMessage Reference */}
                                                {msg.parentMessage && (
                                                    <div className={`mb-1 p-2 rounded-lg bg-white/5 border-l-2 border-primary-500 text-[10px] text-slate-500 max-w-full truncate`}>
                                                        <span className="font-bold text-primary-400">Replying to: </span>
                                                        {msg.parentMessage.content}
                                                    </div>
                                                )}

                                                <div className={`p-4 rounded-2xl text-sm relative group ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'glass-card text-slate-200 rounded-tl-none'
                                                    }`}>
                                                    {msg.content}

                                                    {/* Helpful Tag UI */}
                                                    {helpfulCount > 0 && (
                                                        <div className="absolute -bottom-3 right-0 bg-slate-800 border border-white/10 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-xl">
                                                            <ThumbsUp className="w-3 h-3 text-primary-400 fill-primary-400" />
                                                            <span className="text-[10px] font-bold text-primary-400">{helpfulCount}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Bar & Read Receipts */}
                                                <div className={`flex items-center gap-4 mt-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <div className="flex gap-3">
                                                        {!isMe && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleHelpful(msg._id)}
                                                                    className={`flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${isHelpfulByMe ? 'text-primary-400' : 'text-slate-600 hover:text-slate-400'
                                                                        }`}
                                                                >
                                                                    <ThumbsUp className={`w-3 h-3 ${isHelpfulByMe ? 'fill-primary-400' : ''}`} />
                                                                    Helpful
                                                                </button>
                                                                <button
                                                                    onClick={() => setReplyTo(msg)}
                                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-600 hover:text-primary-400 transition-colors"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    Reply
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReport(msg._id)}
                                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-600 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Flag className="w-3 h-3" />
                                                                    Report
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {isMe && (
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                                            {readCount > 1 ? (
                                                                <span className="text-emerald-500 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Read by {readCount - 1}
                                                                </span>
                                                            ) : (
                                                                <span>Sent</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-900/10">
                            {replyTo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-primary-600/10 border-l-4 border-primary-500 rounded-lg flex justify-between items-center"
                                >
                                    <div className="text-xs">
                                        <p className="font-bold text-primary-400 uppercase tracking-widest text-[9px] mb-1">Replying to {replyTo.sender.name}</p>
                                        <p className="text-slate-400 italic line-clamp-1">"{replyTo.content}"</p>
                                    </div>
                                    <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-white/5 rounded text-slate-500"><Plus className="w-4 h-4 rotate-45" /></button>
                                </motion.div>
                            )}
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message #${activeCommunity.name}`}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card p-8 border border-white/10 relative z-50">
                            <h3 className="text-2xl font-bold text-white mb-6">Create New Hub</h3>
                            <form onSubmit={handleCreateRoom} className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">Hub Name</label>
                                    <input required type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">Workspace Type</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'student-group', label: 'Student Project Group', icon: UserIcon, desc: 'For hackathons & projects' },
                                            { id: 'student-student', label: 'General Knowledge Hub', icon: GraduationCap, desc: 'Ask doubts & share notes' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setNewRoomType(t.id)}
                                                className={`p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${newRoomType === t.id ? 'bg-primary-600/20 border-primary-500 text-white' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10'}`}
                                            >
                                                <div className="p-2 bg-slate-950 rounded-lg"><t.icon className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-sm font-bold">{t.label}</p>
                                                    <p className="text-[10px] opacity-60 uppercase">{t.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20">Create Hub</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Community;
