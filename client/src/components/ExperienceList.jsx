import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
    MessageSquare, Video, User, Building2,
    Filter, Play, ChevronLeft, ChevronRight,
    Search, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExperienceList = () => {
    const [experiences, setExperiences] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) fetchExperiences();
        else fetchAllRecentExperiences();
    }, [selectedCompany, page]);

    const fetchCompanies = async () => {
        try {
            const { data } = await API.get('/opportunities');
            // Extract unique companies
            const uniqueCompanies = [];
            const seen = new Set();
            (data || []).forEach(opp => {
                if (opp.postedBy && !seen.has(opp.postedBy._id)) {
                    seen.add(opp.postedBy._id);
                    uniqueCompanies.push(opp.postedBy);
                }
            });
            setCompanies(uniqueCompanies);
        } catch (err) {
            console.error('Failed to fetch companies', err);
        }
    };

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/experience/company/${selectedCompany}?page=${page}`);
            setExperiences(data?.experiences || []);
            setTotalPages(data?.pages || 1);
        } catch (err) {
            console.error('Failed to fetch experiences', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRecentExperiences = async () => {
        // Fallback or generic view if no company selected
        // For simplicity, let's just show an empty state or prompt selection
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Filter by Corporate Entity</h3>
                </div>
                <select
                    value={selectedCompany}
                    onChange={e => { setSelectedCompany(e.target.value); setPage(1); }}
                    className="bg-slate-950 border border-white/10 rounded-xl px-6 py-3 text-xs text-white uppercase font-bold focus:border-emerald-500 transition-all outline-none md:w-64"
                >
                    <option value="">Select Opportunity Node</option>
                    {(companies || []).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="py-20 text-center"><p className="text-slate-500 animate-pulse uppercase font-black tracking-widest">Retrieving logs...</p></div>
            ) : selectedCompany ? (
                <div className="space-y-6">
                    {(experiences || []).length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6">
                                {(experiences || []).map((exp) => (
                                    <motion.div
                                        key={exp._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card p-8 border-white/5 bg-slate-900/40 relative overflow-hidden"
                                    >
                                        <Quote className="absolute top-4 right-8 w-12 h-12 text-white/[0.03]" />
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-600/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                    <User className="w-6 h-6 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white uppercase tracking-tight">{exp.studentName}</h4>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Hiring Cycle Feedback</p>
                                                </div>
                                            </div>
                                            {exp.type === 'video' && (
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        {exp.type === 'text' ? (
                                            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{exp.content}"</p>
                                        ) : (
                                            <div className="aspect-video bg-black rounded-2xl mb-6 flex items-center justify-center group cursor-pointer relative overflow-hidden">
                                                <video src={exp.videoUrl} className="w-full h-full object-cover opacity-50" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                                        <Play className="w-6 h-6 text-white fill-current" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-6">
                                                    <span className="text-[10px] font-black text-white uppercase bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Video Briefing Attached</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest pt-6 border-t border-white/5">
                                            Verified Entry • {new Date(exp.createdAt).toLocaleDateString()}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-3 bg-white/5 rounded-xl disabled:opacity-20 hover:bg-emerald-600 transition-all group"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-white" />
                                    </button>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Cycle {page} of {totalPages}</span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-3 bg-white/5 rounded-xl disabled:opacity-20 hover:bg-emerald-600 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center glass-card border-dashed border-white/5">
                            <p className="text-slate-600 font-black uppercase tracking-widest italic text-sm">No historical logs found for this entity.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-24 text-center">
                    <Building2 className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest mb-2">Awaiting Target Selection</h3>
                    <p className="text-slate-800 text-xs font-bold uppercase">Select a company to decrypt student experience logs.</p>
                </div>
            )}
        </div>
    );
};

export default ExperienceList;
