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
    HelpCircle,
    Star,
    Trophy,
    Target
} from 'lucide-react';
import { io } from 'socket.io-client';
import PracticeModuleManager from '../components/PracticeModuleManager';
import BranchSelect from '../components/BranchSelect';


const FacultyDashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [teamRequests, setTeamRequests] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [dashTab, setDashTab] = useState('guidance'); // guidance, evaluation
    const [teams, setTeams] = useState([]);
    const [evaluatingTeam, setEvaluatingTeam] = useState(null);
    const [evalForm, setEvalForm] = useState({
        grade: 'A',
        feedback: '',
        criteria: { technicalComplexity: 8, documentation: 8, collaboration: 8, presentation: 8 }
    });
    const socketRef = useRef(null);

    // Project form state
    const [projTitle, setProjTitle] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projSkills, setProjSkills] = useState('');
    const [projBranch, setProjBranch] = useState('');
    const [branchFilter, setBranchFilter] = useState('');


    useEffect(() => {
        fetchInitialData();

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { token: user.token }
        });
        socketRef.current = socket;

        socket.on('team_request', ({ team }) => {
            setTeamRequests(prev => [team, ...(prev || [])]);
        });

        socket.on('new_project_message', (msg) => {
            setMessages(prev => [...(prev || []), msg]);
        });

        return () => socket.disconnect();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const [projRes, teamRes] = await Promise.all([
                API.get('/faculty/projects'),
                API.get('/faculty/teams/pending')
            ]);
            setProjects(projRes.data || []);
            setTeamRequests(teamRes.data || []);
            if ((projRes.data || []).length > 0) {
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
        setDashTab('guidance');
        if (socketRef.current) {
            socketRef.current.emit('join_project', project._id);
        }
        try {
            const [msgRes, teamRes] = await Promise.all([
                API.get(`/faculty/projects/${project._id}/messages`),
                API.get(`/evaluations/project/${project._id}`)
            ]);
            setMessages(msgRes.data || []);
            setTeams(teamRes.data || []);
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
                branch: projBranch,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            setProjects(prev => [data, ...(prev || [])]);
            setShowInviteModal(false);
            setProjTitle('');
            setProjDesc('');
            setProjSkills('');
            setProjBranch('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleTeamAction = async (teamId, status) => {
        try {
            await API.put(`/faculty/teams/${teamId}`, { status });
            setTeamRequests(prev => (prev || []).filter(t => t._id !== teamId));
            handleProjectSelect(selectedProject);
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

    const submitEvaluation = async (e) => {
        e.preventDefault();
        try {
            await API.post('/evaluations', {
                teamId: evaluatingTeam._id,
                projectId: selectedProject._id,
                ...evalForm
            });
            handleProjectSelect(selectedProject);
            setEvaluatingTeam(null);
        } catch (err) {
            alert('Failed to submit evaluation');
        }
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
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter uppercase">Professor Portal</h1>
                    <p className="text-slate-400 italic">Manage research project nodes and coordinate specialist squadrons.</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-primary-600/20"
                >
                    <Plus className="w-5 h-5" /> Launch Project
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="glass-card p-4 overflow-hidden border-white/5 bg-slate-900/40">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Filter by Branch</h3>
                        <div className="mb-4 px-2">
                            <BranchSelect value={branchFilter} onChange={setBranchFilter} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Active Nodes</h3>
                        <div className="space-y-2">
                            {(projects || []).filter(p => !branchFilter || p.branch === branchFilter).map(p => (

                                <button
                                    key={p._id}
                                    onClick={() => handleProjectSelect(p)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedProject?._id === p._id ? 'bg-primary-500/10 border-primary-500/50 border text-white' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
                                >
                                    <p className="font-bold text-sm truncate uppercase tracking-tight">{p.title}</p>
                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{p.status}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card p-4 border-white/5 bg-slate-900/40">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2 flex items-center justify-between">
                            Inbound Requests
                            {(teamRequests || []).length > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse font-black">{(teamRequests || []).length}</span>}
                        </h3>
                        <div className="space-y-3">
                            {(teamRequests || []).map(req => (
                                <div key={req._id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Team: {req.name}</p>
                                    <p className="text-[9px] text-slate-500 mb-3 font-black uppercase tracking-widest">{req.project?.title}</p>
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

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedProject ? (
                        <>
                            <div className="glass-card p-8 border-l-4 border-l-primary-500 bg-slate-900/40">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{selectedProject.title}</h2>
                                        <div className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary-500" /> {(teams || []).length} Squads Attached</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> Due: {new Date(selectedProject.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium italic">{selectedProject.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedProject.requiredSkills || []).map(s => (
                                        <span key={s} className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black rounded-lg uppercase border border-white/5 tracking-widest">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 self-start">
                                {[
                                    { id: 'guidance', label: 'Mentorship & Practice', icon: Target },
                                    { id: 'evaluation', label: 'Team Evaluation', icon: Trophy }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setDashTab(t.id)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${dashTab === t.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <t.icon className="w-3.5 h-3.5" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {dashTab === 'evaluation' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Assigned Squads</h3>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {(teams || []).map(team => (
                                                <div key={team._id} className={`p-6 glass-card border-white/5 flex flex-col justify-between group transition-all ${evaluatingTeam?._id === team._id ? 'border-primary-500/50 bg-primary-500/5' : 'bg-slate-900/40'}`}>
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="font-black text-white uppercase tracking-tight text-sm">{team.name}</h4>
                                                            {team.evaluation ? (
                                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20">GRADED: {team.evaluation.grade}</span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-lg border border-amber-500/20 uppercase">Pending Review</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 mb-6">
                                                            {(team.members || []).map(m => (
                                                                <p key={m.user?._id} className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">• {m.user?.name} ({m.user?.studentProfile?.studentID || 'ID-MISSING'})</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setEvaluatingTeam(team);
                                                            if (team.evaluation) {
                                                                setEvalForm({
                                                                    grade: team.evaluation.grade,
                                                                    feedback: team.evaluation.feedback,
                                                                    criteria: team.evaluation.criteria
                                                                });
                                                            } else {
                                                                setEvalForm({
                                                                    grade: 'A',
                                                                    feedback: '',
                                                                    criteria: { technicalComplexity: 8, documentation: 8, collaboration: 8, presentation: 8 }
                                                                });
                                                            }
                                                        }}
                                                        className="w-full py-3 bg-white/5 hover:bg-primary-600 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        {team.evaluation ? 'Revise Assessment' : 'Evaluate Performance'}
                                                    </button>
                                                </div>
                                            ))}
                                            {(teams || []).length === 0 && (
                                                <div className="p-8 text-center glass-card border-dashed border-white/5 bg-white/[0.01]">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No squads assigned to this node.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sticky top-0">
                                        {evaluatingTeam ? (
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 border-primary-500/30 bg-primary-500/5 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Evaluation: {evaluatingTeam.name}</h3>
                                                    <button onClick={() => setEvaluatingTeam(null)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                                                </div>
                                                <form onSubmit={submitEvaluation} className="space-y-8">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Grade Matrix</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                                                                <button
                                                                    key={g}
                                                                    type="button"
                                                                    onClick={() => setEvalForm({ ...evalForm, grade: g })}
                                                                    className={`w-12 h-12 rounded-xl font-black text-xs transition-all border ${evalForm.grade === g ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                                                                >
                                                                    {g}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                        {(Object.keys(evalForm.criteria || {}) || []).map(key => (
                                                            <div key={key}>
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">
                                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </label>
                                                                    <span className="text-[10px] font-black text-primary-500">{evalForm.criteria[key]}/10</span>
                                                                </div>
                                                                <input
                                                                    type="range" min="1" max="10"
                                                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                                                    value={evalForm.criteria[key]}
                                                                    onChange={e => setEvalForm({
                                                                        ...evalForm,
                                                                        criteria: { ...evalForm.criteria, [key]: parseInt(e.target.value) }
                                                                    })}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Faculty Briefing / Feedback</label>
                                                        <textarea
                                                            rows="4"
                                                            className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:ring-1 focus:ring-primary-500 outline-none placeholder:text-slate-700 font-medium"
                                                            placeholder="Deployment insights and feedback for the squadron..."
                                                            value={evalForm.feedback}
                                                            onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })}
                                                        />
                                                    </div>

                                                    <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-600/40 hover:bg-primary-700 transition-all border border-primary-500">
                                                        Submit Tactical Review
                                                    </button>
                                                </form>
                                            </motion.div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-800 p-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-slate-900/10 min-h-[500px]">
                                                <Star className="w-12 h-12 mb-4 opacity-5" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Select squadron for performance analysis</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Real-time Mentorship Hub */}
                                    <div className="glass-card flex flex-col h-[600px] bg-slate-900/40 border-white/5">
                                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-primary-500" />
                                                Intel Relay (Doubt Hub)
                                            </h3>
                                        </div>
                                        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                            <AnimatePresence>
                                                {(messages || []).map((m, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        key={m._id || idx}
                                                        className={`flex flex-col ${m.sender.role === 'faculty' ? 'items-end' : 'items-start'}`}
                                                    >
                                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${m.sender.role === 'faculty' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                            {m.isDoubt && <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-amber-400 mb-2 border border-amber-400/20 px-1.5 py-0.5 rounded-md self-start bg-amber-400/5"><HelpCircle className="w-3 h-3" /> Priority Intel Needed</span>}
                                                            {m.text}
                                                        </div>
                                                        <span className="text-[8px] text-slate-600 mt-2 uppercase font-black tracking-widest">{m.sender.name} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        <form onSubmit={sendMessage} className="p-6 bg-slate-950 border-t border-white/5 flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Transmit guidance..."
                                                className="flex-grow bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-slate-700 font-medium"
                                            />
                                            <button type="submit" className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                                        <PracticeModuleManager context="faculty" contextId={selectedProject?._id} />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-40 text-slate-700 border-2 border-dashed border-white/5 rounded-[4rem] bg-slate-900/10">
                            <Target className="w-20 h-20 mb-6 opacity-5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize project node to begin operations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Creation Overlay */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowInviteModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] w-full max-w-2xl relative z-10 shadow-3xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600" />
                            <h2 className="text-3xl font-black text-white mb-10 uppercase tracking-tighter">Initiate Research Node</h2>
                            <form onSubmit={createProject} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Tactical Heading</label>
                                    <input required value={projTitle} onChange={e => setProjTitle(e.target.value)} type="text" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold placeholder:text-slate-800" placeholder="e.g. Distributed Ledger Prototypes" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mission Parameters / Description</label>
                                    <textarea required value={projDesc} onChange={e => setProjDesc(e.target.value)} rows="5" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none font-medium placeholder:text-slate-800" placeholder="Detail the technical objectives..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Specialization Matrix (Skills)</label>
                                    <input value={projSkills} onChange={e => setProjSkills(e.target.value)} type="text" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold placeholder:text-slate-800" placeholder="e.g. React, Node.js (Comma separated)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Target Branch</label>
                                    <BranchSelect value={projBranch} onChange={setProjBranch} />
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => setShowInviteModal(false)} type="button" className="flex-1 py-5 bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Abort</button>
                                    <button type="submit" className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all border border-primary-500">Deploy Node</button>
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
