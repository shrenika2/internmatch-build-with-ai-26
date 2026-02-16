import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Users, LayoutDashboard, PlusCircle, Clock,
    ChevronRight, Zap, MessageSquare, Bell, FileText,
    ExternalLink, Loader2, User, Settings, LogOut,
    CheckCircle2, XCircle, Ban, MapPin, Globe, Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PracticeModuleManager from '../components/PracticeModuleManager';

const CompanyDashboard = () => {
    const { user, logout, refreshUserStatus } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedOppForPractice, setSelectedOppForPractice] = useState(null);

    useEffect(() => {
        if (user?.status === 'approved') {
            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [statsRes, oppsRes, appsRes] = await Promise.all([
                API.get('/company/stats'),
                API.get('/company/opportunities'),
                API.get('/company/applicants')
            ]);
            setStats(statsRes.data || null);
            setOpportunities(oppsRes.data || []);
            setApplicants(appsRes.data || []);
        } catch (err) {
            console.error('Data fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOppStatusUpdate = async (oppId, status) => {
        try {
            setActionLoading(oppId);
            await API.put(`/admin/opportunities/${oppId}/status`, { status });
            await fetchAllData();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApplicationStatus = async (appId, status) => {
        try {
            setActionLoading(appId);
            await API.put(`/company/applications/${appId}/status`, { status });
            await fetchAllData();
        } catch (err) {
            alert('Failed to update applicant status');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    // RESTRICTED ACCESS SCREEN
    if (user?.status !== 'approved') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass-card p-10 border-white/5"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-emerald-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Verification Pending</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Your corporate profile is currently under review by our administrative team.
                        Access to the Hiring Command Center will be unlocked once your credentials are verified.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={refreshUserStatus}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all uppercase text-xs tracking-widest shadow-lg shadow-emerald-600/20"
                        >
                            Check Status
                        </button>
                        <button
                            onClick={logout}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl transition-all uppercase text-xs tracking-widest"
                        >
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'opportunities', label: 'My Postings', icon: Briefcase, count: opportunities?.length || 0 },
        { id: 'applicants', label: 'Applicants', icon: Users, count: applicants?.length || 0 },
        { id: 'profile', label: 'Company Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/40 border-r border-white/5 flex flex-col fixed h-full z-40">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/40">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">HR Panel</h1>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">PortalX Enterprise</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {(menuItems || []).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all ${activeSection === item.id
                                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-1'
                                : 'hover:bg-white/5 text-slate-500 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-slate-600'}`} />
                                {item.label}
                            </div>
                            {item.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeSection === item.id ? 'bg-white text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-12 overflow-x-hidden">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-1">
                            {(menuItems || []).find(m => m.id === activeSection)?.label}
                        </h2>
                        <p className="text-slate-500 font-medium italic">Command Center: {user.companyProfile?.companyName || user.name}</p>
                    </div>
                    <Link
                        to="/company/post-opportunity"
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create Posting
                    </Link>
                </header>

                <AnimatePresence mode="wait">
                    {activeSection === 'overview' && stats && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard label="Active Postings" value={stats.activePostings} icon={Briefcase} color="emerald" />
                                <StatsCard label="Total Applicants" value={stats.totalApplicants} icon={Users} color="blue" />
                                <StatsCard label="Shortlisted" value={stats.shortlistedCount} icon={CheckCircle2} color="purple" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-card p-8 border-white/5 bg-slate-900/40">
                                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-emerald-500" />
                                        Rapid Applicant Stream
                                    </h3>
                                    <div className="space-y-4">
                                        {(stats.recentApplications || []).length > 0 ? (
                                            (stats.recentApplications || []).map((app, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase">{app.student?.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest mt-0.5">APPLIED FOR: {app.opportunity?.title}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase italic">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-slate-600 italic">No recent activity detected.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-card p-8 border-white/5 bg-slate-900/40">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-purple-500" />
                                            Active Benchmarks
                                        </h3>
                                    </div>
                                    <Benchmark label="Application Quality" value={78} color="emerald" />
                                    <Benchmark label="System Response Time" value={92} color="blue" />
                                    <Benchmark label="Shortlist Conversion" value={45} color="purple" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'opportunities' && (
                        <motion.div key="opportunities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {(opportunities || []).map(opp => (
                                    <div key={opp._id} className="glass-card p-8 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{opp.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${opp.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {opp.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {opp.type}</span>
                                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {opp.location}</span>
                                                    <span className="flex items-center gap-2 italic text-emerald-500">DEADLINE: {new Date(opp.deadline).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link to={`/company/opportunities/${opp._id}/shortlist`} className="px-6 py-3 bg-white/5 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-2">
                                                    <Zap className="w-4 h-4" /> Shortlist
                                                </Link>
                                                <button
                                                    onClick={() => handleOppStatusUpdate(opp._id, opp.status === 'open' ? 'closed' : 'open')}
                                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-[11px] font-black uppercase transition-all"
                                                >
                                                    {opp.status === 'open' ? 'Close Node' : 'Initialize'}
                                                </button>
                                                <button
                                                    onClick={() => setSelectedOppForPractice(selectedOppForPractice?._id === opp._id ? null : opp)}
                                                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-2 ${selectedOppForPractice?._id === opp._id ? 'bg-emerald-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
                                                >
                                                    <FileText className="w-4 h-4" /> Practice
                                                </button>
                                            </div>
                                        </div>

                                        {selectedOppForPractice?._id === opp._id && (
                                            <div className="mt-8 pt-8 border-t border-white/5">
                                                <PracticeModuleManager context="company" contextId={opp._id} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(opportunities || []).length === 0 && (
                                    <div className="py-20 glass-card border-dashed border-white/10 text-center">
                                        <p className="text-slate-600 italic">No active opportunities deployed to grid.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'applicants' && (
                        <motion.div key="applicants" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="glass-card border-white/5 bg-slate-900/40 rounded-[2.5rem] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] border-b border-white/5">
                                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <th className="px-8 py-6">Candidate Node</th>
                                            <th className="px-8 py-6">Target Deployment</th>
                                            <th className="px-8 py-6 text-center">Resume</th>
                                            <th className="px-8 py-6 text-center">Audit Status</th>
                                            <th className="px-8 py-6 text-right">Protocol</th>

                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(applicants || []).map(app => (
                                            <tr key={app._id} className="hover:bg-white/[0.01] transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <p className="text-sm font-black text-white uppercase">{app.student?.name}</p>
                                                            <p className="text-[10px] text-slate-600 font-medium">{app.student?.email}</p>
                                                        </div>
                                                        {app.skillMatchScore > 0 && (
                                                            <div className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                                                                <p className="text-[9px] font-black text-primary-500 uppercase tracking-tighter">{app.skillMatchScore}% MATCH</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{app.opportunity?.title}</p>
                                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase italic">{app.opportunity?.type}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {app.resume ? (
                                                        <a
                                                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${app.resume}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-primary-500 hover:text-white transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" /> View
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-700 uppercase font-black">Missing</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center">

                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        app.status === 'shortlisted' ? 'bg-blue-500/10 text-blue-500' :
                                                            app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 text-nowrap">
                                                    <button
                                                        onClick={() => navigate(`/company/student-profile/${app.student?._id}`)}
                                                        className="p-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                        title="View Profile"
                                                    ><ExternalLink className="w-4 h-4" /></button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app._id, 'shortlisted')}
                                                        className="p-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                                        title="Shortlist"
                                                    ><CheckCircle2 className="w-4 h-4" /></button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app._id, 'rejected')}
                                                        className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                        title="Reject"
                                                    ><XCircle className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(applicants || []).length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center text-slate-600 italic">No inbound application traffic detected.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl">
                            <div className="glass-card p-10 border-white/5 bg-slate-900/40">
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="w-32 h-32 bg-emerald-600/10 rounded-[2rem] border border-white/5 flex items-center justify-center">
                                        <Building2 className="w-16 h-16 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.companyProfile?.companyName || user.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> {user.companyProfile?.website || 'No website'}</span>
                                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {user.companyProfile?.location || 'HQ Location'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Industry Identity</label>
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-300 font-bold uppercase text-sm">
                                            {user.companyProfile?.industry || 'Unspecified Industry'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">HR Contact Hash</label>
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-300 font-bold uppercase text-sm">
                                            {user.email || 'hr@company.com'}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Corporate Mission Bio</label>
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-slate-400 font-medium text-sm leading-relaxed">
                                            {user.companyProfile?.description || 'Corporate description initialization required.'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                        Update Profile Matrix
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const StatsCard = ({ label, value, icon: Icon, color }) => (
    <div className="glass-card p-8 border-white/5 bg-slate-900/40 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-${color}-500/10 transition-all`} />
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 bg-${color}-500/10 rounded-2xl`}>
                <Icon className={`w-6 h-6 text-${color}-500`} />
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    </div>
);

const Benchmark = ({ label, value, color }) => (
    <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-black text-${color}-500`}>{value}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'circOut' }}
                className={`h-full bg-${color}-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
            />
        </div>
    </div>
);

export default CompanyDashboard;
