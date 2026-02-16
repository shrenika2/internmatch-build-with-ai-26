import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Filter, Search,
    BookOpen, Video, Link as LinkIcon,
    Loader2, Clock, ShieldCheck, Activity,
    ExternalLink, Briefcase, GraduationCap
} from 'lucide-react';

const PracticeResources = () => {
    const [practiceData, setPracticeData] = useState({ corporate: [], academic: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('corporate');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPracticeModules = async () => {
            try {
                const { data } = await API.get('/student/practice');
                setPracticeData(data || { corporate: [], academic: [] });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch practice modules:', err);
                setLoading(false);
            }
        };
        fetchPracticeModules();
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            default: return <LinkIcon className="w-5 h-5" />;
        }
    };

    const getSourceInfo = (module) => {
        if (module?.postedByRole === 'company') {
            return {
                label: module?.company?.companyProfile?.companyName || module?.company?.name || 'Recruiter',
                icon: <Briefcase className="w-3 h-3" />,
                color: 'text-emerald-500'
            };
        }
        return {
            label: `Prof. ${module?.faculty?.name || 'Academic Authority'}`,
            icon: <GraduationCap className="w-3 h-3" />,
            color: 'text-purple-500'
        };
    };

    const filteredModules = (practiceData?.[activeTab] || []).filter(m =>
        (m.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <header className="mb-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <ShieldCheck className="w-3 h-3" /> Practice & Prep Module
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Preparation Command</h1>
                    <p className="text-slate-500 font-medium">Access curated materials from company recruiters and academic mentors.</p>
                </motion.div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('corporate')}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'corporate' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Briefcase className="w-4 h-4" /> Corporate
                    </button>
                    <button
                        onClick={() => setActiveTab('academic')}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'academic' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <GraduationCap className="w-4 h-4" /> Academic
                    </button>
                </div>

                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Filter content protocols..."
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                    {(filteredModules || []).length > 0 ? (
                        filteredModules.map((module) => {
                            const source = getSourceInfo(module);
                            return (
                                <motion.div
                                    key={module._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-6 border-white/5 flex flex-col justify-between group hover:bg-slate-900/40 transition-all"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-2 rounded-lg bg-white/5 ${source.color}`}>
                                                {getTypeIcon(module.contentType)}
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-500 tracking-widest">
                                                {module.type}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">
                                            {module.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                                            {module.description || 'Verified preparatory content for professional skill acquisition.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center">
                                                {source.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">
                                                {source.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={module.fileUrl || module.externalLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full px-4 py-2 bg-white/5 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                Initialize <ExternalLink className="w-3 h-3" />
                                            </a>
                                            {module?.assessmentCount > 0 && module?.company?._id && (
                                                <Link
                                                    to={`/student/arena/${module.company._id}`}
                                                    className="w-full px-4 py-2 bg-primary-600/10 hover:bg-primary-600 text-primary-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-primary-500/20"
                                                >
                                                    Start Arena Simulation <Zap className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center glass-card border-dashed border-white/5"
                        >
                            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-800" />
                            <p className="text-slate-600 font-black uppercase tracking-widest italic text-xs">Repository empty in this sector.</p>
                            <p className="text-slate-700 text-[10px] mt-2 font-bold uppercase tracking-tight">Apply to opportunities or check academic groups for updates.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PracticeResources;
