import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import ReadinessStats from '../components/ReadinessStats';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    MessageSquare,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Bell,
    Megaphone,
    FileText,
    TrendingUp,
    UserCircle,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [feedItems, setFeedItems] = useState([]);
    const [appliedResources, setAppliedResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [annRes, oppRes, appRes] = await Promise.all([
                    API.get('/announcements'),
                    API.get('/opportunities'),
                    API.get('/opportunities/my-applications')
                ]);

                const announcements = annRes.data.map(a => ({ ...a, feedType: 'announcement' }));
                const opportunities = oppRes.data.map(o => ({ ...o, feedType: 'opportunity' }));

                const combinedFeed = [...announcements, ...opportunities]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10);

                setFeedItems(combinedFeed);

                // Fetch resources for applied opportunities
                if (appRes.data.length > 0) {
                    const appOppIds = appRes.data.map(app => app.opportunity._id);
                    // This is a bit inefficient if many applications, but for MVP it's fine
                    const resPromises = appOppIds.map(id => API.get(`/resources?opportunity=${id}`));
                    const resResults = await Promise.all(resPromises);
                    const allResources = resResults.flatMap(r => r.data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setAppliedResources(allResources.slice(0, 5));
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();

            const socket = io('http://localhost:5000', {
                auth: { token: user.token }
            });
            socketRef.current = socket;

            socket.on('new_opportunity', (opp) => {
                setFeedItems(prev => [{ ...opp, feedType: 'opportunity', isNew: true }, ...prev].slice(0, 10));
            });

            socket.on('new_announcement', (ann) => {
                setFeedItems(prev => [{ ...ann, feedType: 'announcement', isNew: true }, ...prev].slice(0, 10));
            });

            return () => socket.disconnect();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Campus Pulse</h1>
                    <p className="text-slate-400">Everything happening at PICT, right now.</p>
                </motion.div>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 self-start">
                    <div className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Ready for hire
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Unified Live Feed */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Featured Opportunities Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                Active Opportunities
                            </h2>
                            <Link to="/student/opportunities" className="text-xs font-black text-slate-500 hover:text-emerald-500 uppercase tracking-widest transition-all">View All Nodes</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feedItems.filter(i => i.feedType === 'opportunity').length > 0 ? (
                                feedItems.filter(i => i.feedType === 'opportunity').map((item) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card p-6 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">
                                                {item.type}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-slate-500 text-xs mb-4 uppercase font-bold tracking-tight">{item.postedBy?.name || 'Institutional Partner'}</p>

                                        <div className="flex items-center gap-4 text-[10px] text-slate-600 font-black uppercase tracking-widest mb-6">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5 text-emerald-500/50 italic">Live Deployment</span>
                                        </div>

                                        <Link
                                            to={`/student/opportunities/${item._id}`}
                                            className="w-full py-3 bg-white/5 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            Initialize Details <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-2 py-12 text-center glass-card border-dashed border-white/5">
                                    <p className="text-slate-600 italic">No active opportunity nodes detected in grid.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Bulletins Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Megaphone className="w-5 h-5 text-purple-500" />
                                Corporate Bulletins
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {feedItems.filter(i => i.feedType === 'announcement').length > 0 ? (
                                feedItems.filter(i => i.feedType === 'announcement').map((item) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                                <Megaphone className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{new Date(item.createdAt).toLocaleDateString()} • {item.postedBy?.name || 'Academic Office'}</p>
                                            </div>
                                        </div>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noreferrer" className="p-2 bg-white/5 text-slate-600 hover:text-white rounded-lg transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                    <p className="text-slate-700 text-[11px] font-black uppercase tracking-widest italic">Grid Bulletin clear.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Performance & Activity */}
                <div className="space-y-8">
                    <section className="glass-card p-8 border-primary-500/20 bg-primary-500/[0.02]">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            Readiness Score
                        </h3>
                        <ReadinessStats compact={true} />
                        <Link to="/student/practice" className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Improve Score
                        </Link>
                    </section>

                    <section className="glass-card p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-500" />
                            My Prep Materials
                        </h3>
                        <div className="space-y-4">
                            {appliedResources.length > 0 ? (
                                appliedResources.map(res => (
                                    <a
                                        key={res._id}
                                        href={res.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{res.title}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{res.type} • {res.relatedOpportunity?.title || 'General'}</p>
                                        </div>
                                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-600">
                                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Apply to jobs to see prep material here</p>
                                </div>
                            )}
                        </div>
                        {appliedResources.length > 0 && (
                            <Link to="/student/resources" className="mt-4 block text-center text-xs text-slate-500 hover:text-primary-400">
                                View all materials
                            </Link>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
