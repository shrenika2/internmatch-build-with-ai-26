import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, MessageSquare,
    BookOpen, Bell, Search, Activity, Zap, UserCircle
} from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Derive active section from the current path
    const activeSection = location.pathname.split('/').pop();

    const navigation = [
        { id: 'overview', label: 'Protocol Overview', icon: LayoutDashboard, path: '/student/dashboard/overview' },
        { id: 'profile', label: 'Career Profile', icon: UserCircle, path: '/student/dashboard/profile' },
        { id: 'team', label: 'Team Formation', icon: Users, path: '/student/dashboard/team' },
        { id: 'experience', label: 'Experience Wall', icon: MessageSquare, path: '/student/dashboard/experience' },
        { id: 'guidance', label: 'Guidance Hub', icon: BookOpen, path: '/student/dashboard/guidance' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-primary-500/30">
            {/* Sidebar Navigation */}
            <nav className="fixed left-0 top-0 bottom-0 w-24 bg-slate-950/50 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-10 z-50">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-16 shadow-2xl shadow-primary-600/20">
                    <Zap className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 flex flex-col gap-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`p-4 rounded-2xl transition-all group relative flex items-center justify-center ${activeSection === item.id
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20'
                                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            title={item.label}
                        >
                            <item.icon className="w-6 h-6" />
                            {activeSection === item.id && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute -inset-1 rounded-2xl bg-primary-500/20 blur-md -z-10"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto flex flex-col gap-6">
                    <Link
                        to="/student/notifications"
                        className={`p-4 transition-colors relative rounded-2xl ${activeSection === 'notifications' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                    >
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950" />
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs text-slate-400">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pl-24 pt-10 min-h-screen">
                <div className="max-w-[1600px] mx-auto px-10 pb-20">
                    {/* Non-blocking Verification Banner */}
                    {!user?.isVerified && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-between backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-black uppercase tracking-tight">Profile Not Verified</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Your account is active, but awaiting administrative verification for full access.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
                                Learn More
                            </button>
                        </motion.div>
                    )}

                    {/* Dynamic Header */}
                    <header className="flex items-center justify-between mb-16">
                        <div>
                            <div className="flex items-center gap-3 text-primary-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                                <Activity className="w-3.5 h-3.5" />
                                System Integrity: Optimal
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                                {navigation.find(n => n.id === activeSection)?.label || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Global Search..."
                                    className="bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary-500/50 w-64 transition-all"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Content Switcher - Now handled by Routing */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        </div>
    );
};

export default StudentDashboard;
