import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    GraduationCap,
    Briefcase,
    ShieldAlert,
    History,
    Settings,
    LogOut,
    CheckCircle2,
    XCircle,
    Ban,
    Trash2,
    Loader2,
    Search,
    Filter,
    ArrowUpRight,
    ClipboardList,
    MessageSquare,
    Zap,
    Save,
    ShieldCheck,
    Activity,
    Cpu,
    Database,
    Wifi,
    HardDrive
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const [broadcastData, setBroadcastData] = useState({ title: '', message: '', targetGroup: 'all', link: '/' });
    const [health, setHealth] = useState(null);

    useEffect(() => {
        fetchInitialData();
        fetchSettings();

        const healthInterval = setInterval(fetchHealth, 10000);
        fetchHealth();

        return () => clearInterval(healthInterval);
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await API.get('/admin/system-health');
            setHealth(res.data);
        } catch (err) {
            console.error('Failed to fetch health metrics');
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await API.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch settings');
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await API.put('/admin/settings', settings);
            setSettings(res.data);
            alert('SYSTEM RECONFIGURED: New parameters has been successfully applied to the grid.');
        } catch (err) {
            alert('PROTOCOL ERROR: Failed to synchronize settings.');
        } finally {
            setSaving(false);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, oppsRes, appsRes, expRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users'),
                API.get('/admin/opportunities'),
                API.get('/admin/applications'),
                API.get('/experience/pending')
            ]);
            setStats(statsRes.data || null);
            setUsers(usersRes.data || []);
            setOpportunities(oppsRes.data || []);
            setApplications(appsRes.data || []);
            setExperiences(expRes.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        setActionLoading(userId);
        try {
            if (action === 'delete') {
                if (window.confirm('Are you sure? This action is permanent.')) {
                    await API.delete(`/admin/users/${userId}`);
                    setUsers(prev => (prev || []).filter(u => u._id !== userId));
                }
            } else {
                await API.put(`/admin/${action}/${userId}`);
                const usersRes = await API.get('/admin/users');
                setUsers(usersRes.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleOppAction = async (oppId, status) => {
        setActionLoading(oppId);
        try {
            await API.put(`/admin/opportunities/${oppId}/status`, { status });
            const oppsRes = await API.get('/admin/opportunities');
            setOpportunities(oppsRes.data);
        } catch (err) {
            alert('Status update failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExperienceAction = async (id, status) => {
        setActionLoading(id);
        try {
            await API.patch(`/experience/${id}/approve`, { status });
            setExperiences(prev => (prev || []).filter(e => e._id !== id));
        } catch (err) {
            alert('Moderation failed');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    const filteredUsers = (users || []).filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleBroadcast = async (e) => {
        e.preventDefault();
        setActionLoading('broadcast');
        try {
            await API.post('/admin/broadcast', broadcastData);
            alert('BROADCAST DISSEMINATED: Message successfully transmitted through the grid.');
            setBroadcastData({ title: '', message: '', targetGroup: 'all', link: '/' });
        } catch (err) {
            alert('TRANSMISSION ERROR: Failed to broadcast signal.');
        } finally {
            setActionLoading(null);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Analytics', icon: LayoutDashboard },
        { id: 'users', label: 'Identity Management', icon: Users },
        { id: 'approvals', label: 'User Approvals', icon: CheckCircle2, count: (users || []).filter(u => u.status === 'pending').length },
        { id: 'broadcast', label: 'Broadcast Protocol', icon: MessageSquare },
        { id: 'opportunities', label: 'Moderate Opportunities', icon: Briefcase },
        { id: 'experiences', label: 'Experience Moderation', icon: MessageSquare, count: experiences?.length || 0 },
        { id: 'applications', label: 'Audit Trail', icon: ClipboardList },
        { id: 'logs', label: 'System Integrity', icon: Activity },
        { id: 'settings', label: 'Administration Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/40 border-r border-white/5 flex flex-col fixed h-full z-40">
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-600/40">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">AdminOS</h1>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">V3.0 Secure</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {(menuItems || []).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${activeSection === item.id
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 translate-x-1'
                                : 'hover:bg-white/5 text-slate-500 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-slate-600'}`} />
                                {item.label}
                            </div>
                            {item.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeSection === item.id ? 'bg-white text-primary-600' : 'bg-red-500 text-white'
                                    }`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 bg-slate-900/20">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-12 overflow-x-hidden">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-white tracking-tight capitalize">ADMIN CONTROL PANEL</h2>
                            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/30">System Lock Active</span>
                        </div>
                        <p className="text-slate-500 font-medium italic">Standard Administrative Protocol Active</p>
                    </div>
                    <div className="flex items-center gap-6 bg-slate-900/40 p-3 pr-6 rounded-3xl border border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center font-black text-white text-xl uppercase">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">System Master</p>
                        </div>
                    </div>
                </header>

                {activeSection === 'overview' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Active Students', value: stats?.students || 0, icon: Users, color: 'text-blue-500' },
                                { label: 'Verified Partners', value: stats?.companies || 0, icon: Building2, color: 'text-primary-500' },
                                { label: 'Faculty Nodes', value: stats?.faculty || 0, icon: GraduationCap, color: 'text-purple-500' },
                                { label: 'Global Opportunities', value: stats?.activeOpportunities || 0, icon: Briefcase, color: 'text-emerald-500' },
                            ].map(card => (
                                <div key={card.label} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-8 ${card.color} opacity-10 group-hover:scale-150 transition-transform duration-700`}>
                                        <card.icon className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{card.value}</h3>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <ShieldAlert className="w-6 h-6 text-primary-500" /> System Integrity Monitor
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Urgent Actions</p>
                                    {(users || []).filter(u => u.status === 'pending').slice(0, 3).map(u => (
                                        <div key={u._id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pending {u.role}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveSection('approvals')} className="p-2 hover:bg-white/5 rounded-xl"><ArrowUpRight className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-10 bg-gradient-to-br from-primary-600/20 to-transparent border border-white/5 rounded-3rem flex flex-col justify-center items-center text-center">
                                    <ShieldAlert className="w-16 h-16 text-primary-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <h4 className="text-2xl font-black text-white mb-2">Maximum Oversight</h4>
                                    <p className="text-slate-400 text-sm">Action logs are encrypted and verified against system policies.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'users' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-white/5">
                            <Search className="w-5 h-5 text-slate-500 ml-2" />
                            <input type="text" placeholder="Search system database..." className="bg-transparent border-none focus:ring-0 text-sm font-black text-white w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"><th className="px-8 py-6">Identity</th><th className="px-8 py-6 text-center">Role</th><th className="px-8 py-6 text-center">Status</th><th className="px-8 py-6 text-right">Protocol</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(filteredUsers || []).map(u => (
                                        <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-6 text-white font-black">{u.name}<br /><span className="text-[10px] text-slate-500 font-medium">{u.email}</span></td>
                                            <td className="px-8 py-6 text-center"><span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-primary-600/10 text-primary-400">{u.role}</span></td>
                                            <td className="px-8 py-6 text-center"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.status === 'approved' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>{u.status}</span></td>
                                            <td className="px-8 py-6 text-right flex justify-end gap-2">
                                                {u.role !== 'admin' && (
                                                    <>
                                                        <button onClick={() => handleUserAction(u._id, u.status === 'blocked' ? 'unblock' : 'block')} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-slate-500"><Ban className="w-4 h-4" /></button>
                                                        <button onClick={() => handleUserAction(u._id, 'delete')} className="p-3 bg-white/5 rounded-2xl hover:bg-slate-700 hover:text-white transition-all text-slate-500"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === 'broadcast' && (
                    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                <MessageSquare className="w-8 h-8 text-primary-500" />
                                Initiate Global Broadcast
                            </h3>
                            <form onSubmit={handleBroadcast} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Transmission Header</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                            value={broadcastData.title}
                                            onChange={e => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                            placeholder="System Maintenance Announcement..."
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Sector</label>
                                        <select
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold uppercase tracking-widest text-[10px]"
                                            value={broadcastData.targetGroup}
                                            onChange={e => setBroadcastData({ ...broadcastData, targetGroup: e.target.value })}
                                        >
                                            <option value="all">Global Broadcast (All)</option>
                                            <option value="student">Student Nodes</option>
                                            <option value="company">Corporate Entities</option>
                                            <option value="faculty">Faculty Facilitators</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Signal Content</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-[2rem] py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium leading-relaxed"
                                        value={broadcastData.message}
                                        onChange={e => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                        placeholder="Attention all users: The system will undergo maintenance at..."
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                        value={broadcastData.link}
                                        onChange={e => setBroadcastData({ ...broadcastData, link: e.target.value })}
                                        placeholder="/student/dashboard"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading === 'broadcast'}
                                    className="w-full py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-4"
                                >
                                    {actionLoading === 'broadcast' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Execute Transmission
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeSection === 'applications' && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"><th className="px-8 py-6">Student Cluster</th><th className="px-8 py-6">Target Node</th><th className="px-8 py-6 text-center">Timestamp</th><th className="px-8 py-6 text-center">Auth Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(applications || []).map(app => (
                                    <tr key={app._id} className="hover:bg-white/[0.01]">
                                        <td className="px-8 py-6 text-white font-black">{app.student?.name}<br /><span className="text-[10px] text-slate-500">{app.student?.email}</span></td>
                                        <td className="px-8 py-6 text-white font-black">{app.opportunity?.title}<br /><span className="text-[10px] text-primary-500">{app.opportunity?.postedBy?.name}</span></td>
                                        <td className="px-8 py-6 text-center text-[10px] text-slate-500">{new Date(app.createdAt).toLocaleString()}</td>
                                        <td className="px-8 py-6 text-center"><span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-primary-600/10 text-primary-400">{app.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === 'approvals' && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-8 py-6">Pending Request</th>
                                    <th className="px-8 py-6 text-center">Designated Role</th>
                                    <th className="px-8 py-6 text-right">Verification Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(users || []).filter(u => u.status === 'pending').map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.01]">
                                        <td className="px-8 py-6 text-white font-black">{u.name}<br /><span className="text-primary-500 text-[10px]">{u.email}</span></td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-primary-600/10 text-primary-400">{u.role}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button onClick={() => handleUserAction(u._id, 'reject')} className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase">Decline</button>
                                            <button onClick={() => handleUserAction(u._id, 'approve')} className="px-4 py-2 bg-primary-600 rounded-xl text-[10px] font-black uppercase text-white">Validate</button>
                                        </td>
                                    </tr>
                                ))}
                                {(users || []).filter(u => u.status === 'pending').length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center text-slate-600 italic font-medium">
                                            No pending verification requests at this time.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === 'opportunities' && (
                    <div className="space-y-6">
                        {(opportunities || []).map(opp => (
                            <div key={opp._id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group">
                                <div><h4 className="text-xl font-black text-white uppercase">{opp.title}</h4><p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Managed by: {opp.postedBy?.name}</p></div>
                                <div className="space-x-3">
                                    <button onClick={() => handleOppAction(opp._id, opp.status === 'open' ? 'closed' : 'open')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${opp.status === 'open' ? 'bg-red-600/10 text-red-500' : 'bg-emerald-600/10 text-emerald-500'}`}>
                                        {opp.status === 'open' ? 'Terminate Stream' : 'Enable Stream'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === 'logs' && health && (
                    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
                        <header className="flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Activity className="w-8 h-8 text-emerald-500" />
                                    System Integrity Dashboard
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Live Uplink Established | Last Heartbeat: {new Date(health.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* DB Health */}
                            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <Database className="w-6 h-6 text-primary-500" />
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${health.database.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {health.database.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MongoDB Latency</p>
                                    <p className="text-2xl font-black text-white">{health.database.latency}</p>
                                </div>
                            </div>

                            {/* Memory Usage */}
                            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <HardDrive className="w-6 h-6 text-purple-500" />
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${health.system.memory.usagePercentage < 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {health.system.memory.usagePercentage}% Load
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory (Heap)</p>
                                    <p className="text-2xl font-black text-white">{health.system.memory.heapUsed}MB / {health.system.memory.heapTotal}MB</p>
                                </div>
                            </div>

                            {/* API Performance */}
                            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <Zap className="w-6 h-6 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-white/5 text-slate-400 rounded-md">
                                        Last 100 Requests
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Response Time</p>
                                    <p className="text-2xl font-black text-white">{health.api.avgResponseTime}ms</p>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <Wifi className="w-6 h-6 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">
                                        Real-time
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Sockets</p>
                                    <p className="text-2xl font-black text-white">{health.sockets.activeConnections}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Resource Distribution */}
                            <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem]">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Asset Categorization</h4>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Student Profiles', value: health.counts.users.students, total: health.counts.users.total, color: 'bg-blue-500' },
                                        { label: 'Corporate Partners', value: health.counts.users.company, total: health.counts.users.total, color: 'bg-primary-500' },
                                        { label: 'Faculty Mentors', value: health.counts.users.faculty, total: health.counts.users.total, color: 'bg-purple-500' },
                                    ].map(item => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex justify-between text-[11px] font-black uppercase">
                                                <span className="text-white">{item.label}</span>
                                                <span className="text-slate-500">{item.value} / {item.total}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000`}
                                                    style={{ width: `${(item.value / item.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error Rate Monitor */}
                            <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 mb-6 ${health.api.errorRate < 1 ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'}`}>
                                    <span className="text-2xl font-black">{health.api.errorRate}%</span>
                                </div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-2">API Reliability Index</h4>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    {health.api.totalErrors} Errors in {health.api.totalRequests} total transmissions
                                </p>
                            </div>
                        </div>

                        {/* Node.js Runtime Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-5">
                                <Cpu className="w-8 h-8 text-slate-700" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU Architecture</p>
                                    <p className="text-sm font-black text-white uppercase">{health.system.cpu.platform} | {health.system.cpu.cores} Cores</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-5">
                                <Activity className="w-8 h-8 text-slate-700" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Load</p>
                                    <p className="text-sm font-black text-white uppercase">{health.system.cpu.loadAvg[0].toFixed(2)} / {health.system.cpu.loadAvg[1].toFixed(2)} / {health.system.cpu.loadAvg[2].toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-5">
                                <History className="w-8 h-8 text-slate-700" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process Uptime</p>
                                    <p className="text-sm font-black text-white uppercase">{Math.floor(health.system.uptime / 3600)}h {Math.floor((health.system.uptime % 3600) / 60)}m {Math.floor(health.system.uptime % 60)}s</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'experiences' && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-8 py-6">Student</th>
                                    <th className="px-8 py-6">Company</th>
                                    <th className="px-8 py-6">Content</th>
                                    <th className="px-8 py-6 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(experiences || []).map(exp => (
                                    <tr key={exp._id} className="hover:bg-white/[0.01]">
                                        <td className="px-8 py-6 text-white font-black">{exp.isAnonymous ? 'Anonymous' : exp.studentId?.name}</td>
                                        <td className="px-8 py-6 text-white font-black">{exp.companyId?.companyProfile?.companyName || exp.companyId?.name}</td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-md">
                                                <p className="text-xs text-slate-400 line-clamp-2">{exp.type === 'text' ? exp.content : `Video: ${exp.videoUrl}`}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button onClick={() => handleExperienceAction(exp._id, 'rejected')} className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase">Reject</button>
                                            <button onClick={() => handleExperienceAction(exp._id, 'approved')} className="px-4 py-2 bg-emerald-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-600/20">Approve</button>
                                        </td>
                                    </tr>
                                ))}
                                {(experiences || []).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-600 italic font-medium">
                                            No pending student experiences to moderate.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection === 'settings' && settings && (
                    <div className="max-w-5xl space-y-10 animate-in fade-in duration-700 pb-20">
                        <header className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <ShieldCheck className="w-8 h-8 text-primary-500" />
                                    Global Platform Governance
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                                    Last synchronized: {new Date(settings.updatedAt).toLocaleString()} | Operator: {settings.lastUpdatedBy?.name || 'SYSTEM'}
                                </p>
                            </div>
                            <button
                                onClick={handleUpdateSettings}
                                disabled={saving}
                                className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/40 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Commit Parameters
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section: AUTH & ACCESS CONTROL */}
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Identity & Access Protocol</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">Student Auto-Approval</p>
                                            <p className="text-[10px] text-slate-500 font-bold">Bypass manual verification for .edu emails</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, enableStudentAutoApproval: !settings.enableStudentAutoApproval })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${settings.enableStudentAutoApproval ? 'bg-primary-600' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableStudentAutoApproval ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">Corporate Auto-Approval</p>
                                            <p className="text-[10px] text-slate-500 font-bold">New companies start as 'approved'</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, enableCompanyAutoApproval: !settings.enableCompanyAutoApproval })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${settings.enableCompanyAutoApproval ? 'bg-primary-600' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableCompanyAutoApproval ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase">Restricted Email Domains</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white"
                                            placeholder="google.com, microsoft.com"
                                            value={settings.allowedCompanyEmailDomains.join(', ')}
                                            onChange={(e) => setSettings({ ...settings, allowedCompanyEmailDomains: e.target.value.split(',').map(d => d.trim()) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: OPPORTUNITY RULES */}
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Engagement constraints</h4>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Max Applications</p>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-black"
                                                value={settings.maxApplicationsPerStudent}
                                                onChange={(e) => setSettings({ ...settings, maxApplicationsPerStudent: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Cooldown (Days)</p>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-black"
                                                value={settings.applicationCooldownDays}
                                                onChange={(e) => setSettings({ ...settings, applicationCooldownDays: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">AI Shortlisting</p>
                                            <p className="text-[10px] text-slate-500 font-bold">Enable algorithmic ranking for companies</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, enableAIShortlisting: !settings.enableAIShortlisting })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${settings.enableAIShortlisting ? 'bg-emerald-600' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableAIShortlisting ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">Multiple Active Offers</p>
                                            <p className="text-[10px] text-slate-500 font-bold">Allow students to hold &gt;1 accepted offer</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, allowMultipleActiveOffers: !settings.allowMultipleActiveOffers })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${settings.allowMultipleActiveOffers ? 'bg-emerald-600' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.allowMultipleActiveOffers ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section: PLATFORM FEATURE TOGGLES */}
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Module availability</h4>
                                <div className="space-y-6">
                                    {[
                                        { key: 'enablePracticeModule', label: 'Practice Framework', desc: 'Mock tests & readiness scoring' },
                                        { key: 'enableCommunityChat', label: 'Community Hub', desc: 'Real-time project & global chats' },
                                        { key: 'enableExperienceSharing', label: 'Knowledge Base', desc: 'Student interview & work reviews' },
                                    ].map(feature => (
                                        <div key={feature.key} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-black text-white">{feature.label}</p>
                                                <p className="text-[10px] text-slate-500 font-bold">{feature.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, [feature.key]: !settings[feature.key] })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${settings[feature.key] ? 'bg-purple-600' : 'bg-slate-800'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[feature.key] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: SYSTEM LIMITS */}
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Resource constraints</h4>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Max Resume Size (MB)</p>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-black"
                                                value={settings.maxResumeSizeMB}
                                                onChange={(e) => setSettings({ ...settings, maxResumeSizeMB: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Cloud Storage Path</p>
                                            <div className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-xl py-2 px-4">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{settings.enableCloudStorage ? 'AWS S3 Active' : 'Local Storage'}</span>
                                                <button
                                                    onClick={() => setSettings({ ...settings, enableCloudStorage: !settings.enableCloudStorage })}
                                                    className={`w-8 h-4 rounded-full transition-all relative ${settings.enableCloudStorage ? 'bg-amber-500' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${settings.enableCloudStorage ? 'right-0.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase">Allowed Extensions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['pdf', 'docx', 'doc', 'jpg'].map(ext => (
                                                <button
                                                    key={ext}
                                                    onClick={() => {
                                                        const newExts = settings.allowedResumeFormats.includes(ext)
                                                            ? settings.allowedResumeFormats.filter(e => e !== ext)
                                                            : [...settings.allowedResumeFormats, ext];
                                                        setSettings({ ...settings, allowedResumeFormats: newExts });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${settings.allowedResumeFormats.includes(ext)
                                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                                        : 'bg-white/5 text-slate-600 border border-transparent'}`}
                                                >
                                                    .{ext}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log Hint */}
                        <div className="mt-8 bg-slate-900/20 border border-white/5 p-6 rounded-3xl flex items-center gap-6">
                            <Zap className="w-10 h-10 text-primary-500 opacity-50" />
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">Administrative Audit Active</p>
                                <p className="text-[10px] text-slate-500 font-medium">All parameter shifts are encrypted and logged with operator ID: {user?._id}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
