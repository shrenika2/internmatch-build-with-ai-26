import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Plus,
    Users,
    FileText,
    MessageSquare,
    Check,
    X,
    Loader2,
    Clock,
    Send,
    ExternalLink,
    HelpCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import PracticeModuleManager from '../components/PracticeModuleManager';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [teamRequests, setTeamRequests] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const socketRef = useRef(null);

    // Project form state
    const [projTitle, setProjTitle] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projSkills, setProjSkills] = useState('');

    useEffect(() => {
        fetchInitialData();

        const socket = io('http://localhost:5000', {
            auth: { token: user.token }
        });
        socketRef.current = socket;

        socket.on('team_request', ({ team }) => {
            setTeamRequests(prev => [team, ...prev]);
        });

        socket.on('new_project_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socket.disconnect();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const [projRes, teamRes] = await Promise.all([
                API.get('/faculty/projects'),
                API.get('/teams/my') // Assuming this returns teams where faculty is mentor
            ]);
            setProjects(projRes.data);
            setTeamRequests(teamRes.data.filter(t => t.status === 'pending'));
            if (projRes.data.length > 0) {
                handleProjectSelect(projRes.data[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleProjectSelect = async (project) => {
        setSelectedProject(project);
        if (socketRef.current) {
            socketRef.current.emit('join_project', project._id);
        }
        try {
            const { data } = await API.get(`/faculty/projects/${project._id}/messages`);
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const createProject = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/opportunities', {
                title: projTitle,
                description: projDesc,
                type: 'project',
                requiredSkills: projSkills.split(',').map(s => s.trim()),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
            setProjects(prev => [data, ...prev]);
            setShowInviteModal(false);
            setProjTitle('');
            setProjDesc('');
            setProjSkills('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleTeamAction = async (teamId, status) => {
        try {
            await API.put(`/faculty/teams/${teamId}`, { status });
            setTeamRequests(prev => prev.filter(t => t._id !== teamId));
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProject) return;

        const msgData = {
            projectId: selectedProject._id,
            text: newMessage,
            isFacultyReply: true
        };

        socketRef.current.emit('send_project_message', msgData);
        API.post(`/faculty/projects/${selectedProject._id}/messages`, msgData);
        setNewMessage('');
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Professor Portal</h1>
                    <p className="text-slate-400">Manage research projects and mentor team collaborations.</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20"
                >
                    <Plus className="w-5 h-5" /> New Project
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Project List & Team Requests */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="glass-card p-4 overflow-hidden">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 px-2">My Projects</h3>
                        <div className="space-y-2">
                            {projects.map(p => (
                                <button
                                    key={p._id}
                                    onClick={() => handleProjectSelect(p)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedProject?._id === p._id ? 'bg-primary-500/10 border-primary-500/50 border text-white' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
                                >
                                    <p className="font-bold text-sm truncate">{p.title}</p>
                                    <span className="text-[10px] uppercase font-bold text-slate-500">{p.status}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card p-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 px-2 flex items-center justify-between">
                            Team Requests
                            {teamRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{teamRequests.length}</span>}
                        </h3>
                        <div className="space-y-3">
                            {teamRequests.map(req => (
                                <div key={req._id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs font-bold text-white mb-1">Team: {req.name}</p>
                                    <p className="text-[10px] text-slate-500 mb-3">{req.project?.title}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleTeamAction(req._id, 'accepted')} className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                            <Check className="w-3.5 h-3.5 mx-auto" />
                                        </button>
                                        <button onClick={() => handleTeamAction(req._id, 'rejected')} className="flex-1 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                            <X className="w-3.5 h-3.5 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Content: Real-time Mentorship & Doubt Resolution */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedProject ? (
                        <>
                            <div className="glass-card p-8 border-l-4 border-l-primary-500">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h2>
                                        <div className="flex gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 3 Mentored Teams</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">{selectedProject.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.requiredSkills.map(s => (
                                        <span key={s} className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg uppercase border border-white/5">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Live Discussion Hub */}
                                <div className="glass-card flex flex-col h-[500px]">
                                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-primary-500" />
                                            Doubt Resolution Hub
                                        </h3>
                                    </div>
                                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                        <AnimatePresence>
                                            {messages.map((m, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={m._id || idx}
                                                    className={`flex flex-col ${m.sender.role === 'faculty' ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${m.sender.role === 'faculty' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                                        {m.isDoubt && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-400 mb-1"><HelpCircle className="w-3 h-3" /> Doubt</span>}
                                                        {m.text}
                                                    </div>
                                                    <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold">{m.sender.name} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-white/5 flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Reply to doubt..."
                                            className="flex-grow bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                        <button type="submit" className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>

                                {/* REAL Practice Module System */}
                                <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                                    <PracticeModuleManager context="faculty" contextId={selectedProject?._id} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-slate-600">
                            <Layout className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a project to start mentoring</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Creation Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Launch New Project</h2>
                            <form onSubmit={createProject} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Project Title</label>
                                    <input required value={projTitle} onChange={e => setProjTitle(e.target.value)} type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="e.g. Distributed Computing Research" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                    <textarea required value={projDesc} onChange={e => setProjDesc(e.target.value)} rows="4" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" placeholder="Describe project goals..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Required Skills (Comma separated)</label>
                                    <input value={projSkills} onChange={e => setProjSkills(e.target.value)} type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="e.g. C++, Linux, Docker" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowInviteModal(false)} type="button" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all">Publish Project</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FacultyDashboard;
