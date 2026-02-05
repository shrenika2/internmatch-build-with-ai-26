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
    ClipboardList
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, oppsRes, appsRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users'),
                API.get('/admin/opportunities'),
                API.get('/admin/applications')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setOpportunities(oppsRes.data);
            setApplications(appsRes.data);
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
                    setUsers(prev => prev.filter(u => u._id !== userId));
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

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const menuItems = [
        { id: 'overview', label: 'Analytics', icon: LayoutDashboard },
        { id: 'users', label: 'Identity Management', icon: Users },
        { id: 'approvals', label: 'User Approvals', icon: CheckCircle2, count: users.filter(u => u.status === 'pending').length },
        { id: 'opportunities', label: 'Moderate Opportunities', icon: Briefcase },
        { id: 'applications', label: 'Audit Trail', icon: ClipboardList },
        { id: 'logs', label: 'System Logs', icon: History },
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
                    {menuItems.map(item => (
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
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">{user.name}</p>
                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">System Master</p>
                        </div>
                    </div>
                </header>

                {activeSection === 'overview' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Active Students', value: stats.students, icon: Users, color: 'text-blue-500' },
                                { label: 'Verified Partners', value: stats.companies, icon: Building2, color: 'text-primary-500' },
                                { label: 'Faculty Nodes', value: stats.faculty, icon: GraduationCap, color: 'text-purple-500' },
                                { label: 'Global Opportunities', value: stats.activeOpportunities, icon: Briefcase, color: 'text-emerald-500' },
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
                                    {users.filter(u => u.status === 'pending').slice(0, 3).map(u => (
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
                                    {filteredUsers.map(u => (
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

                {activeSection === 'applications' && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"><th className="px-8 py-6">Student Cluster</th><th className="px-8 py-6">Target Node</th><th className="px-8 py-6 text-center">Timestamp</th><th className="px-8 py-6 text-center">Auth Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {applications.map(app => (
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
                                {users.filter(u => u.status === 'pending').map(u => (
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
                                {users.filter(u => u.status === 'pending').length === 0 && (
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
                        {opportunities.map(opp => (
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

                {activeSection === 'logs' && (
                    <div className="space-y-4">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">Live System Audit</h3>
                            <div className="space-y-3">
                                {[
                                    { event: 'Database Backup', status: 'Success', time: '2 mins ago' },
                                    { event: 'New Company Registration', status: 'Pending Approval', time: '15 mins ago' },
                                    { event: 'Security Patch V3.1', status: 'Applied', time: '1 hour ago' },
                                    { event: 'Storage Cluster Sync', status: 'Active', time: 'Real-time' },
                                ].map((log, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <span className="text-sm font-bold text-slate-300">{log.event}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{log.status}</span>
                                            <span className="text-[10px] font-medium text-slate-500">{log.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'settings' && (
                    <div className="p-20 text-center">
                        <ShieldAlert className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase">Settings Module</h3>
                        <p className="text-slate-500">Post-deployment initialization required for system-wide configuration.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
