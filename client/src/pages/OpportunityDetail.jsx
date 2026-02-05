import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, Calendar, Clock, DollarSign,
    ChevronLeft, Send, AlertCircle, CheckCircle2, Loader2,
    FileText, ExternalLink, Activity, Users, MessageSquare, HelpCircle, Plus
} from 'lucide-react';
import { io } from 'socket.io-client';

const OpportunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [opportunity, setOpportunity] = useState(null);
    const [resources, setResources] = useState([]);
    const [practiceModules, setPracticeModules] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamSuccess, setTeamSuccess] = useState(false);

    // Resource upload state
    const [showUpload, setShowUpload] = useState(false);
    const [resTitle, setResTitle] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resType, setResType] = useState('pdf');

    const socketRef = useRef(null);

    // Application form state
    const [resume, setResume] = useState('');
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [oppRes, resRes, practiceRes] = await Promise.all([
                    API.get(`/opportunities/${id}`),
                    API.get(`/resources?opportunity=${id}`),
                    API.get(`/student/practice/opportunity/${id}`)
                ]);
                setOpportunity(oppRes.data);
                setResources(resRes.data);
                setPracticeModules(practiceRes.data);

                // Fetch unified messages for opportunity/project
                const msgRes = await API.get(`/opportunities/${id}/messages`);
                setMessages(msgRes.data);
            } catch (err) {
                console.error(err);
                setError('Opportunity not found');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (user && opportunity) {
            const socket = io('http://localhost:5000', {
                auth: { token: user.token }
            });
            socketRef.current = socket;

            socket.emit('join_opportunity', id);
            socket.emit('join_opportunity_chat', id);

            socket.on('new_resource', (resource) => {
                if (resource.relatedOpportunity === id) {
                    setResources(prev => [resource, ...prev]);
                }
            });

            socket.on('new_opportunity_message', (msg) => {
                setMessages(prev => [...prev, msg]);
            });

            return () => {
                socket.emit('leave_opportunity', id);
                socket.disconnect();
            };
        }
    }, [user, opportunity, id]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        setApplying(true); setError('');
        try {
            await API.post(`/opportunities/${id}/apply`, { resume, coverLetter });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally { setApplying(false); }
    };

    const handleResourceUpload = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/resources', {
                title: resTitle,
                url: resUrl,
                type: resType,
                relatedOpportunity: id
            });
            setResources(prev => [data, ...prev]);
            setShowUpload(false);
            setResTitle('');
            setResUrl('');
        } catch (err) {
            setError('Failed to upload resource');
        }
    };

    const handleTeamRequest = async (e) => {
        e.preventDefault();
        try {
            // Placeholder for mentorship request logic
            setTeamSuccess(true);
            setTimeout(() => setTeamSuccess(false), 3000);
            setTeamName('');
        } catch (err) {
            setError('Failed to send mentorship request');
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            oppId: id,
            projectId: id, // unified
            text: newMessage,
            isDoubt: user.role === 'student'
        };

        socketRef.current.emit('send_opportunity_message', msgData);

        API.post(`/opportunities/${id}/messages`, msgData);
        setNewMessage('');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary-500 animate-spin" /></div>;
    if (!opportunity) return <div className="min-h-screen pt-32 text-center"><p className="text-2xl text-slate-400">Opportunity not found.</p></div>;

    const isOwner = user && opportunity.postedBy._id === user._id;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Feed
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8">
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold uppercase tracking-wider">{opportunity.type}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${opportunity.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{opportunity.status}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">{opportunity.title}</h1>
                        <div className="flex flex-wrap gap-6 text-slate-400 mb-8 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-500" /><span className="font-medium">{opportunity.postedBy.name}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /><span>{opportunity.location}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary-500" /><span>{opportunity.duration || 'Flexible'}</span></div>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                            <p className="text-slate-300 leading-relaxed">{opportunity.description}</p>
                        </div>
                    </div>

                    {/* Unified Live Interaction Hub */}
                    <div className="glass-card flex flex-col h-[450px]">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary-500" />
                                {opportunity.type === 'project' ? ' Mentorship Discussion' : ' Engagement Hub'}
                            </h3>
                            <span className="text-[10px] text-green-400 flex items-center gap-1 font-bold animate-pulse"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live Sync Active</span>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex flex-col ${m.sender._id === user?._id ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${m.sender.role === 'company' ? 'bg-green-600 text-white' :
                                        m.sender.role === 'faculty' ? 'bg-purple-600 text-white' :
                                            m.sender._id === user?._id ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-200'
                                        }`}>
                                        {m.isDoubt && <span className="block text-[9px] font-black uppercase text-yellow-400 mb-1 opacity-70">Query</span>}
                                        {m.text}
                                    </div>
                                    <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold">{m.sender.name} • {m.sender.role}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-white/5 flex gap-2">
                            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} type="text" placeholder="Type a message or doubt..." className="flex-grow bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
                            <button type="submit" className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"><Send className="w-4 h-4" /></button>
                        </form>
                    </div>

                    {/* Preparation / Resources Section */}
                    <div className="glass-card p-8 border-purple-500/20 bg-purple-500/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" /> Preparation Kit</h3>
                            {isOwner && (
                                <button onClick={() => setShowUpload(!showUpload)} className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showUpload && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    onSubmit={handleResourceUpload}
                                    className="mb-6 p-4 bg-slate-950 rounded-2xl border border-white/5 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input required value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="Material Title" className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                                        <input required type="url" value={resUrl} onChange={e => setResUrl(e.target.value)} placeholder="Resource URL (PDF/Link)" className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        {['pdf', 'apti', 'coding', 'link'].map(t => (
                                            <button key={t} type="button" onClick={() => setResType(t)} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${resType === t ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{t}</button>
                                        ))}
                                        <button type="submit" className="ml-auto px-4 py-1 bg-green-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest">Share with students</button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {practiceModules.length > 0 ? practiceModules.map((m) => (
                                <a key={m._id} href={m.fileUrl || m.externalLink} target="_blank" rel="noreferrer" className="p-4 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                            {m.contentType === 'pdf' ? <FileText className="w-5 h-5" /> : m.contentType === 'video' ? <Video className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-emerald-400">{m.title}</p>
                                            <p className="text-[10px] uppercase text-slate-500 font-black">{m.type} • {m.contentType}</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                </a>
                            )) : resources.length > 0 ? resources.map((res) => (
                                <a key={res._id} href={res.url} target="_blank" rel="noreferrer" className="p-4 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                                    <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><FileText className="w-5 h-5" /></div><div><p className="text-sm font-bold text-white group-hover:text-purple-400">{res.title}</p><p className="text-[10px] uppercase text-slate-500 font-black">{res.type}</p></div></div>
                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                </a>
                            )) : (
                                <p className="text-slate-600 text-xs italic">No materials uploaded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 sticky top-24">
                        {opportunity.type === 'project' && user?.role === 'student' && (
                            <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Team Formation</h4>
                                {teamSuccess ? <p className="text-xs text-green-400 font-medium italic">Mentorship request sent!</p> : (
                                    <form onSubmit={handleTeamRequest} className="space-y-3">
                                        <input value={teamName} onChange={e => setTeamName(e.target.value)} required type="text" placeholder="Team Name" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" />
                                        <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all">Request Faculty Mentorship</button>
                                    </form>
                                )}
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-white mb-6">Status & Entry</h3>
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Applied!</h3>
                                <button onClick={() => navigate('/student/dashboard')} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">View Status</button>
                            </div>
                        ) : (
                            (!user || user.role !== 'student') ? (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm font-bold text-center">
                                    {isOwner ? 'Manager Mode Active' : 'Restricted Access'}
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-6">
                                    {error && <div className="p-3 bg-red-500/10 text-red-500 text-[10px] rounded-lg font-bold uppercase">{error}</div>}
                                    <input type="url" required placeholder="Resume Link (URL)" className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm" value={resume} onChange={(e) => setResume(e.target.value)} />
                                    <textarea rows="4" placeholder="Briefly state your suitability..." className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm resize-none" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                                    <button type="submit" disabled={applying} className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">{applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Submit Application</>}</button>
                                </form>
                            )
                        )}

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Origin Hub</h4>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${opportunity.type === 'project' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                    {opportunity.postedBy.name.charAt(0)}
                                </div>
                                <div><p className="text-white font-bold text-sm truncate w-32">{opportunity.postedBy.name}</p><p className="text-slate-500 text-[11px] uppercase font-black tracking-tighter truncate w-32">{opportunity.postedBy.role}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetail;
