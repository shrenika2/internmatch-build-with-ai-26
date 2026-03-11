import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Plus, Users, FileText, MessageSquare, Check, X,
    Loader2, Clock, Send, ExternalLink, HelpCircle, Star,
    Trophy, Target, Sparkles, Code, Award, Activity, Hash, Briefcase
} from 'lucide-react';
import PracticeModuleManager from '../components/PracticeModuleManager';
import BranchSelect from '../components/BranchSelect';


const FacultyDashboard = () => {
    const { user, socket } = useAuth();
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
    const [aiEvaluating, setAiEvaluating] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    const runAIEvaluation = async (teamId) => {
        setAiEvaluating(true);
        setAiResult(null);
        try {
            const { data } = await API.post('/ai/evaluate-team', { teamId });
            setAiResult(data);
            setEvalForm(prev => ({
                ...prev,
                grade: data.evaluation.suggestedGrade,
                feedback: data.evaluation.explanation
            }));
        } catch (err) {
            alert(err.response?.data?.message || 'AI sync failed');
        } finally {
            setAiEvaluating(false);
        }
    };

    const deployTeamHub = async (team) => {
        try {
            const { data } = await API.post('/communities', {
                name: `${team.name} Project Hub`,
                type: 'student-group',
                relatedTeam: team._id,
                relatedOpportunity: selectedProject._id
            });
            alert(`SUCCESS: Tactical Hub "${data.name}" has been deployed. All squadron members have been synchronized.`);
        } catch (err) {
            alert(err.response?.data?.message || 'Deployment failed');
        }
    };

    // Project form state
    const [projTitle, setProjTitle] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projSkills, setProjSkills] = useState('');
    const [projBranch, setProjBranch] = useState(user?.facultyProfile?.department || '');
    const [branchFilter, setBranchFilter] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, submitting, success, error
    const [submissionError, setSubmissionError] = useState('');


    useEffect(() => {
        fetchInitialData();

        if (socket) {
            const onTeamRequest = ({ team }) => {
                setTeamRequests(prev => [team, ...(prev || [])]);
            };

            const onNewProjectMessage = (msg) => {
                setMessages(prev => [...(prev || []), msg]);
            };

            socket.on('team_request', onTeamRequest);
            socket.on('new_project_message', onNewProjectMessage);

            return () => {
                socket.off('team_request', onTeamRequest);
                socket.off('new_project_message', onNewProjectMessage);
            };
        }
    }, [user, socket]);

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
        if (socket) {
            socket.emit('join_project', project._id);
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
        setSubmissionStatus('submitting');
        const payload = {
            title: projTitle,
            description: projDesc,
            type: 'project',
            requiredSkills: projSkills.split(',').map(s => s.trim()),
            branch: projBranch,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        console.log('[DEBUG] Submitting Project Node:', payload);

        try {
            const { data } = await API.post('/opportunities', payload);
            setProjects(prev => [data, ...(prev || [])]);
            setSubmissionStatus('success');
            // Reset fields
            setProjTitle('');
            setProjDesc('');
            setProjSkills('');
            setProjBranch('');
        } catch (err) {
            setSubmissionStatus('error');
            setSubmissionError(err.response?.data?.message || 'Failed to initialize project. Please try again.');
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

        if (socket) {
            socket.emit('send_project_message', msgData);
        }
        API.post(`/faculty/projects/${selectedProject._id}/messages`, msgData);
        setNewMessage('');
    };

    const submitEvaluation = async (e) => {
        e.preventDefault();
        const payload = {
            teamId: evaluatingTeam._id,
            projectId: selectedProject._id,
            ...evalForm
        };

        console.log('[DEBUG] Submitting Evaluation Protocol:', payload);

        try {
            await API.post('/evaluations', payload);
            handleProjectSelect(selectedProject);
            setEvaluatingTeam(null);
            alert('PROTOCOL SUCCESS: Evaluation has been synchronized with the team node.');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to submit evaluation';
            console.error('[DEBUG] Evaluation Submission Failure:', err.response || err);
            alert(`PROTOCOL ERROR: ${errorMsg}`);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* View truncated for brevity - implementation remains same except for socket interaction */}
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
                                                                <p key={m.user?._id} className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">• {m.user?.name}</p>
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
                                        </div>
                                    </div>
                                    <div className="sticky top-0">
                                        {evaluatingTeam && (
                                            <div className="glass-card p-8 border-primary-500/30 bg-primary-500/5 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Evaluation: {evaluatingTeam.name}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => runAIEvaluation(evaluatingTeam._id)}
                                                        disabled={aiEvaluating}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                                                    >
                                                        {aiEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                        AI Assessment
                                                    </button>
                                                </div>

                                                {aiResult && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-950 border border-indigo-500/30 rounded-3xl space-y-6">
                                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                                    <Code className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase">Git Analysis</p>
                                                                    <p className="text-sm font-bold text-white">{aiResult.metrics.commits} Commits • {aiResult.metrics.prs} PRs</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Git Score</p>
                                                                <p className="text-xl font-black text-indigo-400">{aiResult.evaluation.gitScore}/10</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Suggested Grade</p>
                                                                <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg uppercase">{aiResult.evaluation.suggestedGrade}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">"{aiResult.evaluation.explanation}"</p>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4">
                                                            {[
                                                                { label: 'GIT', val: aiResult.evaluation.gitScore },
                                                                { label: 'DOCS', val: aiResult.evaluation.docScore },
                                                                { label: 'TASKS', val: aiResult.evaluation.milestoneScore }
                                                            ].map(stat => (
                                                                <div key={stat.label} className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">{stat.label}</p>
                                                                    <p className="text-xs font-black text-white">{stat.val}/10</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <form onSubmit={submitEvaluation} className="space-y-8">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Grade Matrix</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                                                                <button key={g} type="button" onClick={() => setEvalForm({ ...evalForm, grade: g })} className={`w-12 h-12 rounded-xl font-black text-xs transition-all border ${evalForm.grade === g ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>{g}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Submit Tactical Review</button>
                                                </form>
                                                <div className="pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={() => deployTeamHub(evaluatingTeam)}
                                                        className="w-full py-3 bg-slate-900 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Activity className="w-3.5 h-3.5" />
                                                        Deploy Collaborative Hub
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card flex flex-col h-[600px] bg-slate-900/40 border-white/5">
                                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary-500" /> Intel Relay</h3>
                                        </div>
                                        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                            {(messages || []).map((m, idx) => (
                                                <div key={idx} className={`flex flex-col ${m.sender.role === 'faculty' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${m.sender.role === 'faculty' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'}`}>{m.text}</div>
                                                    <span className="text-[8px] text-slate-600 mt-2 uppercase font-black uppercase tracking-widest">{m.sender.name} • {new Date(m.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={sendMessage} className="p-6 bg-slate-950 border-t border-white/5 flex gap-3">
                                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Transmit guidance..." className="flex-grow bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-xs text-white" />
                                            <button type="submit" className="p-3 bg-primary-600 text-white rounded-xl shadow-lg"><Send className="w-5 h-5" /></button>
                                        </form>
                                    </div>
                                    <PracticeModuleManager context="faculty" contextId={selectedProject?._id} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-slate-900/10">
                            <Target className="w-20 h-20 mb-6 opacity-5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize project node to begin operations</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
                            onClick={() => {
                                if (submissionStatus !== 'submitting') {
                                    setShowInviteModal(false);
                                    setSubmissionStatus('idle');
                                }
                            }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-3xl"
                        >
                            <AnimatePresence mode="wait">
                                {submissionStatus === 'idle' && (
                                    <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Create New Project</h2>
                                        <p className="text-slate-500 text-xs mb-10 font-bold uppercase tracking-widest">Broadcast a new research assignment to eligible student squads.</p>

                                        <form onSubmit={createProject} className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                                                <input required value={projTitle} onChange={e => setProjTitle(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary-500 transition-all" placeholder="e.g. Distributed Neural Networks for Edge Computing" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Academic Branch</label>
                                                    <BranchSelect value={projBranch} onChange={setProjBranch} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tech Stack (CSV)</label>
                                                    <input required value={projSkills} onChange={e => setProjSkills(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary-500 transition-all" placeholder="React, Python, PyTorch" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Scope & Intelligence Guidance</label>
                                                <textarea required value={projDesc} onChange={e => setProjDesc(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white h-32 resize-none focus:border-primary-500 transition-all" placeholder="Detail the technical vision, outcomes, and research objectives..." />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
                                                <button type="submit" className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">Broadcast Project Node</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {submissionStatus === 'submitting' && (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 animate-pulse" />
                                            <Loader2 className="w-16 h-16 text-primary-500 animate-spin relative" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Syncing with Mainframe</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Initializing research node and alerting regional student squadrons...</p>
                                    </motion.div>
                                )}

                                {submissionStatus === 'success' && (
                                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30">
                                            <Check className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Mission Initialized</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10 px-10 leading-relaxed">The project node has been successfully broadcasted. Student teams can now request attachment to this research orbit.</p>
                                        <button
                                            onClick={() => {
                                                setShowInviteModal(false);
                                                setSubmissionStatus('idle');
                                            }}
                                            className="px-12 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
                                        >
                                            Return to Dashboard
                                        </button>
                                    </motion.div>
                                )}

                                {submissionStatus === 'error' && (
                                    <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/30">
                                            <X className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Sync Failure</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10 px-10 leading-relaxed">{submissionError}</p>
                                        <div className="flex gap-4 w-full px-12">
                                            <button
                                                onClick={() => setSubmissionStatus('idle')}
                                                className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                                            >
                                                Retry
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowInviteModal(false);
                                                    setSubmissionStatus('idle');
                                                }}
                                                className="flex-1 py-4 border border-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FacultyDashboard;
