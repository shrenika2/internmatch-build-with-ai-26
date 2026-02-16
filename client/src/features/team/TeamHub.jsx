import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    Users, Plus, Mail, Contact, CheckCircle2,
    XCircle, Lock, Unlock, Loader2, Send,
    ShieldCheck, Code, Server, Brain, Palette,
    Megaphone, Smartphone, Settings, MessageSquare, Activity,
    History, ExternalLink, FileText, ArrowLeft, LayoutGrid,
    ClipboardList, Briefcase, AlertCircle, Clock, Trophy, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { io } from 'socket.io-client';

const TeamHub = () => {
    const { user } = useAuth();
    const [myTeams, setMyTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-teams');
    const [opportunities, setOpportunities] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [activeWorkspace, setActiveWorkspace] = useState(null); // The team ID currently in view

    const [tasks, setTasks] = useState([]);
    const [assets, setAssets] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activities, setActivities] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [evaluation, setEvaluation] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchTeams();
        fetchOpportunities();

        if (user) {
            const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                auth: { token: user.token }
            });
            socketRef.current = socket;

            socket.on('task_created', (task) => {
                setTasks(prev => [...(prev || []), task]);
            });

            socket.on('task_updated', (updatedTask) => {
                setTasks(prev => (prev || []).map(t => t._id === updatedTask._id ? updatedTask : t));
            });

            socket.on('asset_created', (asset) => {
                setAssets(prev => [...(prev || []), asset]);
            });

            socket.on('team:message', (message) => {
                setMessages(prev => [...(prev || []), message]);
                // Auto-read if we are in chat tab? Will implement in Workspace
            });

            socket.on('team:typing_update', (data) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.userId]: data.isTyping ? data.userName : null
                }));
            });

            return () => socket.disconnect();
        }
    }, [user]);

    useEffect(() => {
        if (activeWorkspace) {
            socketRef.current?.emit('join_project', activeWorkspace);
            fetchWorkspaceData(activeWorkspace);
            return () => socketRef.current?.emit('leave_project', activeWorkspace);
        }
    }, [activeWorkspace]);

    const fetchWorkspaceData = async (teamId) => {
        try {
            const [tasksRes, assetsRes, chatRes, activityRes] = await Promise.all([
                API.get(`/teams/${teamId}/tasks`),
                API.get(`/teams/${teamId}/assets`),
                API.get(`/teams/${teamId}/chat`),
                API.get(`/teams/${teamId}/activity`)
            ]);
            setTasks(tasksRes.data);
            setAssets(assetsRes.data);
            setMessages(chatRes.data);
            setActivities(activityRes.data);

            // Fetch evaluation if it exists
            const team = (myTeams || []).find(t => t._id === teamId);
            if (team?.opportunity) {
                const evalRes = await API.get(`/evaluations/project/${team.opportunity._id || team.opportunity}`);
                const teamEvalData = (evalRes.data || []).find(e => e._id === teamId);
                setEvaluation(teamEvalData?.evaluation || null);
            }
        } catch (err) {
            console.error('Failed to fetch workspace data', err);
        }
    };

    const fetchTeams = async () => {
        try {
            const { data } = await API.get('/teams/my');
            setMyTeams(data || []);
        } catch (err) {
            console.error('Failed to fetch teams', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOpportunities = async () => {
        try {
            const { data } = await API.get('/opportunities?type=Project');
            setOpportunities(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTeam = async (opportunity) => {
        const name = prompt(`Enter Team Name for ${opportunity.title}:`);
        if (!name) return;

        try {
            await API.post('/teams', { name, opportunityId: opportunity._id });
            fetchTeams();
            setActiveTab('my-teams');
        } catch (err) {
            alert('Failed to create team');
        }
    };

    const handleRespondToInvite = async (teamId, status) => {
        try {
            await API.put(`/teams/${teamId}/respond`, { status });
            fetchTeams();
        } catch (err) {
            alert('Failed to respond to invite');
        }
    };

    const handleToggleLock = async (teamId) => {
        try {
            await API.put(`/teams/${teamId}/lock`);
            fetchTeams();
        } catch (err) {
            alert('Failed to toggle lock');
        }
    };

    if (activeWorkspace) {
        const team = (myTeams || []).find(t => t._id === activeWorkspace);
        return <TeamWorkspace
            team={team}
            user={user}
            onBack={() => setActiveWorkspace(null)}
            tasks={tasks}
            assets={assets}
            messages={messages}
            activities={activities}
            typingUsers={typingUsers}
            evaluation={evaluation}
            socket={socketRef.current}
            fetchWorkspaceData={() => fetchWorkspaceData(activeWorkspace)}
        />;
    }

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Team Protocol Hub</h2>
                    <p className="text-slate-500 text-sm italic">Assemble squads, define roles, and deploy solutions.</p>
                </div>
                <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('my-teams')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'my-teams' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Connected Squads
                    </button>
                    <button
                        onClick={() => setActiveTab('opportunities')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'opportunities' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Active Clusters
                    </button>
                </div>
            </header>

            {activeTab === 'my-teams' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {(myTeams || []).length > 0 ? (
                        (myTeams || []).map(team => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                currentUserId={user?._id}
                                onInvite={() => { setSelectedTeam(team); setShowInviteModal(true); }}
                                onRespond={handleRespondToInvite}
                                onToggleLock={() => handleToggleLock(team._id)}
                                onOpenWorkspace={() => setActiveWorkspace(team._id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass-card border-dashed border-white/5 bg-white/[0.01]">
                            <Users className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                            <h3 className="text-xl font-bold text-slate-400">No active team engagements.</h3>
                            <button onClick={() => setActiveTab('opportunities')} className="mt-4 text-primary-500 font-black uppercase text-xs tracking-widest hover:text-primary-400">Scan for opportunities</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(opportunities || []).map(opp => (
                        <div key={opp._id} className="glass-card p-8 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between group">
                            <div>
                                <h4 className="text-lg font-black text-white uppercase mb-2 group-hover:text-primary-400 transition-colors">{opp.title}</h4>
                                <p className="text-xs text-slate-500 font-bold mb-6 line-clamp-2">{opp.description}</p>
                            </div>
                            <button
                                onClick={() => handleCreateTeam(opp)}
                                className="w-full py-4 bg-white/5 hover:bg-primary-600 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Initialize Squad
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                team={selectedTeam}
                onSuccess={() => { fetchTeams(); setShowInviteModal(false); }}
            />
        </div>
    );
};

const TeamCard = ({ team, currentUserId, onInvite, onRespond, onToggleLock, onOpenWorkspace }) => {
    const isLead = team?.leader?._id === currentUserId;
    const myStatus = (team?.members || []).find(m => m.user?._id === currentUserId)?.status;

    const roleIcons = {
        'Lead': ShieldCheck,
        'Frontend': Code,
        'Backend': Server,
        'ML': Brain,
        'Design': Palette,
        'Marketing': Megaphone,
        'App': Smartphone,
        'DevOps': Settings
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden border-white/5 bg-slate-900/40 relative"
        >
            <div className={`h-1.5 w-full ${team.isLocked ? 'bg-red-500' : 'bg-primary-500'}`} />
            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{team.name}</h3>
                            {team.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Node: <span className="text-primary-400">{team.opportunity?.title}</span>
                        </p>
                    </div>
                    {isLead && !team.isLocked && (
                        <button
                            onClick={onInvite}
                            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Squad Members</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(team?.members || []).map((member) => {
                            const Icon = roleIcons[member.role] || Users;
                            return (
                                <div key={member.user._id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white uppercase border border-white/5">
                                            {member?.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{member?.user?.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Icon className="w-3 h-3 text-primary-500" />
                                                <p className="text-[9px] text-slate-500 uppercase font-black">{member.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${member.status === 'accepted' ? 'text-emerald-500 bg-emerald-500/10' :
                                        member.status === 'pending' ? 'text-amber-500 bg-amber-500/10' :
                                            'text-red-500 bg-red-500/10'
                                        }`}>
                                        {member.status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex -space-x-3">
                        {(team?.members || []).map(m => (
                            <div key={m.user?._id} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg">
                                {m?.user?.name?.charAt(0) || '?'}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {myStatus === 'accepted' && (
                            <button
                                onClick={onOpenWorkspace}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Workspace
                            </button>
                        )}
                        {myStatus === 'pending' && (
                            <>
                                <button onClick={() => onRespond(team._id, 'rejected')} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Reject</button>
                                <button onClick={() => onRespond(team._id, 'accepted')} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20">Accept</button>
                            </>
                        )}
                        {isLead && (
                            <button
                                onClick={onToggleLock}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${team.isLocked ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                    }`}
                            >
                                {team.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                {team.isLocked ? 'Unlock' : 'Lock'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const InviteModal = ({ isOpen, onClose, team, onSuccess }) => {
    const [identifier, setIdentifier] = useState('');
    const [role, setRole] = useState('Frontend');
    const [loading, setLoading] = useState(false);

    const roles = ['Frontend', 'Backend', 'ML', 'Design', 'Marketing', 'App', 'DevOps'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post(`/teams/${team._id}/invite`, { identifier, role });
            onSuccess();
            setIdentifier('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send invite');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-10 shadow-3xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400" />

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Request Assistance</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium italic">Enter credentials to add a new specialist to your node.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Identifier (Email / ID)</label>
                                <div className="relative">
                                    <Contact className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="PICT-202X-XXX"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold placeholder:text-slate-700"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Specialization Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {roles.map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === r ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Deploy Invitation</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const TeamWorkspace = ({ team, user, onBack, tasks, assets, messages, activities, typingUsers, evaluation, socket, fetchWorkspaceData }) => {
    const [workspaceTab, setWorkspaceTab] = useState('tasks');
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee: '' });
    const [newAsset, setNewAsset] = useState({ name: '', type: 'link', url: '' });
    const [chatMessage, setChatMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (workspaceTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, workspaceTab]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/teams/${team._id}/tasks`, newTask);
            setShowAddTask(false);
            setNewTask({ title: '', description: '', priority: 'medium', assignee: '' });
            fetchWorkspaceData();
        } catch (err) { alert('Failed to create task'); }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            await API.put(`/teams/tasks/${taskId}`, { status });
            fetchWorkspaceData();
        } catch (err) { alert('Failed to update task'); }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/teams/${team._id}/assets`, newAsset);
            setNewAsset({ name: '', type: 'link', url: '' });
            fetchWorkspaceData();
        } catch (err) { alert('Failed to add resource'); }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim()) return;

        try {
            await API.post(`/teams/${team._id}/chat`, { text: chatMessage });
            setChatMessage('');
            socket.emit('team:typing', { teamId: team._id, isTyping: false });
        } catch (err) { alert('Failed to send message'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <LayoutGrid className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all group">
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">{team.name} Workspace</h2>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Users className="w-3 h-3" /> {team?.members?.length || 0} Specialists Connected
                            </span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Verified Tactical Node</span>
                        </div>
                    </div>
                </div>
                <div className="flex bg-slate-950/50 p-1 rounded-[1.5rem] border border-white/5 relative z-10 flex-wrap overflow-hidden">
                    {[
                        { id: 'tasks', label: 'Tactical Board', icon: ClipboardList },
                        { id: 'chat', label: 'Team Chat', icon: MessageSquare },
                        { id: 'activity', label: 'Mission Log', icon: Activity },
                        { id: 'assets', label: 'Assets', icon: Briefcase },
                        { id: 'evaluation', label: 'Evaluation', icon: Trophy }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setWorkspaceTab(tab.id)}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${workspaceTab === tab.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30' : 'text-slate-500 hover:text-white'}`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {workspaceTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <ClipboardList className="w-6 h-6 text-primary-500" />
                                    Active Objectives
                                </h4>
                                <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                                    <Plus className="w-4 h-4" /> New Objective
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {['todo', 'in-progress', 'done'].map(status => (
                                    <div
                                        key={status}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            const taskId = e.dataTransfer.getData('taskId');
                                            handleUpdateTaskStatus(taskId, status);
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center justify-between px-2">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'todo' ? 'bg-slate-500' : status === 'in-progress' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
                                                {status.replace('-', ' ')}
                                            </h5>
                                            <span className="text-[8px] font-black text-slate-700 bg-white/5 px-2 py-0.5 rounded-full">
                                                {(tasks || []).filter(t => t.status === status).length}
                                            </span>
                                        </div>

                                        <div className="space-y-4 min-h-[400px] p-2 rounded-3xl border border-dashed border-white/[0.02] bg-white/[0.01]">
                                            {(tasks || []).filter(t => t.status === status).map(task => (
                                                <motion.div
                                                    layout
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData('taskId', task._id)}
                                                    key={task._id}
                                                    className="glass-card p-5 border-white/5 bg-slate-900/60 space-y-4 hover:border-primary-500/30 transition-all group cursor-grab active:cursor-grabbing"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${task.priority === 'high' || task.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <History className="w-3 h-3 text-slate-600" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold uppercase tracking-tight group-hover:text-primary-400 transition-colors ${task.status === 'done' ? 'opacity-40' : 'text-white'}`}>{task.title}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-[7px] border border-white/5 font-bold text-slate-400 uppercase">
                                                                {task.assignee?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase">{task.assignee?.name || 'Unassigned'}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {(tasks || []).filter(t => t.status === status).length === 0 && (
                                                <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20">
                                                    <span className="text-[8px] font-black uppercase tracking-widest">No Active Tasks</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {workspaceTab === 'chat' && (
                        <div className="glass-card bg-slate-900/40 border-white/5 flex flex-col h-[600px] overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                                {(messages || []).map((msg, i) => (
                                    <div key={msg._id || i} className={`flex flex-col ${msg.sender?._id === user?._id ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.sender._id !== user._id && <span className="text-[8px] font-black text-primary-500 uppercase">{msg.sender.name}</span>}
                                            <span className="text-[7px] text-slate-600 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium ${msg.sender._id === user._id ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-slate-950/50 border-t border-white/5 space-y-3">
                                {Object.values(typingUsers).filter(val => val).length > 0 && (
                                    <p className="text-[8px] font-black text-primary-400 uppercase tracking-widest animate-pulse px-2">
                                        {Object.values(typingUsers).filter(val => val).join(', ')} typing...
                                    </p>
                                )}
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Transmit tactical brief..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={chatMessage}
                                        onChange={(e) => {
                                            setChatMessage(e.target.value);
                                            socket.emit('team:typing', { teamId: team?._id, isTyping: (e.target.value || "").length > 0 });
                                        }}
                                        onBlur={() => socket.emit('team:typing', { teamId: team?._id, isTyping: false })}
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {workspaceTab === 'activity' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter px-4 flex items-center gap-3">
                                <Activity className="w-6 h-6 text-primary-500" />
                                Mission Log
                            </h4>
                            <div className="space-y-4">
                                {(activities || []).map((activity) => (
                                    <div key={activity._id} className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-start gap-4 hover:bg-slate-900 transition-all border-l-2 border-l-primary-500">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 mt-1">
                                            {activity.type === 'TASK_CREATED' ? <Plus className="w-4 h-4 text-emerald-500" /> :
                                                activity.type === 'TASK_UPDATED' ? <History className="w-4 h-4 text-primary-500" /> :
                                                    activity.type === 'PROJECT_LOCKED' ? <Lock className="w-4 h-4 text-red-500" /> :
                                                        <Activity className="w-4 h-4 text-slate-500" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">{activity.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-black text-slate-500 uppercase">{activity.user?.name}</span>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                <span className="text-[9px] font-black text-slate-600 uppercase italic">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {workspaceTab === 'assets' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter px-4">Shared Intelligence</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {(assets || []).map(asset => (
                                    <div key={asset._id} className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-slate-900 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-all">
                                                {asset.type === 'link' ? <Link className="w-5 h-5 text-slate-500 group-hover:text-primary-400" /> : <FileText className="w-5 h-5 text-slate-500 group-hover:text-primary-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{asset.name}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Uploaded by {asset.uploadedBy?.name}</p>
                                            </div>
                                        </div>
                                        <a href={asset.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 hover:bg-primary-600 text-[10px] font-black uppercase text-slate-400 hover:text-white rounded-lg transition-all">Access Asset</a>
                                    </div>
                                ))}
                                <form onSubmit={handleAddAsset} className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input required className="md:col-span-1 bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white" placeholder="Resource Name..." value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
                                        <input required className="md:col-span-1 bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white" placeholder="https://..." value={newAsset.url} onChange={e => setNewAsset({ ...newAsset, url: e.target.value })} />
                                        <button type="submit" className="bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Transmit Link</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {workspaceTab === 'evaluation' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 px-4">
                                <Trophy className="w-6 h-6 text-amber-500" />
                                Project Assessment
                            </h4>

                            {evaluation ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 glass-card p-10 flex flex-col items-center justify-center text-center space-y-4 border-primary-500/30 bg-primary-500/5">
                                        <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-600/40 border border-primary-400/50">
                                            <span className="text-4xl font-black text-white">{evaluation.grade}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Squad Grade</p>
                                            <p className="text-sm font-bold text-white uppercase italic">"{evaluation.grade === 'A+' ? 'Legendary' : evaluation.grade === 'A' ? 'Elite' : 'Operational'}"</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-6">
                                        <div className="glass-card p-8 border-white/5 bg-slate-900/40">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Command Feedback</p>
                                            <p className="text-slate-300 text-xs leading-relaxed font-medium italic">
                                                {evaluation.feedback || "The evaluation is complete. Command has no additional tactical notes at this time."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {evaluation?.criteria && Object.entries(evaluation.criteria).map(([key, val]) => (
                                                <div key={key} className="glass-card p-4 border-white/5 bg-slate-900/40">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        <span className="text-[10px] font-black text-primary-500">{val}/10</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${val * 10}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center glass-card border-dashed border-white/5 bg-white/[0.01]">
                                    <Star className="w-12 h-12 mx-auto mb-4 text-slate-800 opacity-20" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Node assessment pending faculty verification.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <aside className="space-y-8">
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem]">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Mission Details</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <AlertCircle className="w-5 h-5 text-primary-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">Current Phase</p>
                                    <p className="text-xs font-bold text-white">Execution & Integration</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">Tactical Lockdown</p>
                                    <p className="text-xs font-bold text-white">{team.isLocked ? 'Activated' : 'Standby'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem]">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Specialist Roster</h4>
                        <div className="space-y-3">
                            {(team?.members || []).map(member => (
                                <div key={member.user?._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5">
                                            {member.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase group-hover:text-primary-400 transition-colors">{member.user?.name}</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {showAddTask && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddTask(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-3xl">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                                <Plus className="w-6 h-6 text-primary-500" />
                                Initiate New Objective
                            </h3>
                            <form onSubmit={handleCreateTask} className="space-y-6">
                                <div className="space-y-1 px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Task Heading</label>
                                    <input required className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                                </div>
                                <div className="space-y-1 px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Briefing</label>
                                    <textarea rows={3} className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Index</label>
                                        <select className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-white" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assign Specialist</label>
                                        <select className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-white" value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}>
                                            <option value="">Mission Default</option>
                                            {(team?.members || []).map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary-600/30 transition-all mt-4">Pin Objective</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamHub;
