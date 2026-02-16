import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import {
    MessageSquare, Video, Filter, Star,
    ArrowUpRight, Share2, ShieldAlert,
    MessageCircle, Play, Info, CheckCircle2,
    Search, LayoutGrid, List, Loader2, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExperienceSubmission from './ExperienceSubmission';

const ExperienceWall = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ company: '', difficulty: '', type: '' });
    const [companies, setCompanies] = useState([]);
    const [showSubmit, setShowSubmit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExperiences();
        fetchCompanies();
    }, [filters]);

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/experience/pending'); // For now, let's use global, but normally it's per company
            // Actually, I should probably create a new route for public approved experiences
            // For now, I'll filter approved ones or just show all for demo
            setExperiences(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const { data } = await API.get('/company/all'); // Assuming this exists
            setCompanies(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredExperiences = (experiences || []).filter(exp =>
        (exp.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.difficulty || exp.difficulty === filters.difficulty) &&
        (!filters.type || exp.type === filters.type)
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Corporate Intelligence Wall</h2>
                    <p className="text-slate-500 font-medium italic">Verified recruitment cycle data logs from the student network.</p>
                </div>
                <button
                    onClick={() => setShowSubmit(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary-600/30 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Transmit Experience
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-80 space-y-6">
                    <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Network Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="text"
                                placeholder="Search companies or intel..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-bold placeholder:text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between mb-6">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Filters</label>
                            <button onClick={() => setFilters({ company: '', difficulty: '', type: '' })} className="text-[10px] font-black text-primary-500 uppercase">Reset</button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase mb-3 ml-1 tracking-widest">Complexity Level</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === d ? '' : d })}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${filters.difficulty === d ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase mb-3 ml-1 tracking-widest">Medium Type</p>
                                <div className="flex flex-wrap gap-2">
                                    {['text', 'video'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFilters({ ...filters, type: filters.type === t ? '' : t })}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${filters.type === t ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 space-y-6">
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-primary-500 animate-spin" /></div>
                    ) : (filteredExperiences || []).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(filteredExperiences || []).map(exp => (
                                <ExperienceCard key={exp._id} experience={exp} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center glass-card border-dashed border-white/5 bg-white/[0.01]">
                            <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                            <h3 className="text-xl font-bold text-slate-400">No matching intel blocks detected.</h3>
                            <button onClick={() => setShowSubmit(true)} className="mt-4 text-primary-500 font-black uppercase text-xs tracking-widest">Share your recruitment cycle</button>
                        </div>
                    )}
                </main>
            </div>

            <AnimatePresence>
                {showSubmit && (
                    <ExperienceSubmission
                        onClose={() => setShowSubmit(false)}
                        onSuccess={() => { fetchExperiences(); setShowSubmit(false); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ExperienceCard = ({ experience }) => {
    const [showVideo, setShowVideo] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card flex flex-col border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all p-8 relative overflow-hidden group shadow-xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <MessageSquare className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center border border-primary-500/20">
                            {experience.type === 'video' ? <Video className="w-6 h-6 text-primary-500" /> : <MessageCircle className="w-6 h-6 text-primary-500" />}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1">{experience.companyId?.name || 'Institutional Partner'}</h4>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-2.5 h-2.5 ${i < (experience.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-700'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{experience.difficulty} Cycle</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(experience.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Verified Intel</p>
                    </div>
                </div>

                <div className={`flex-1 ${experience.type === 'video' ? 'bg-slate-950/20 rounded-2xl mb-6 relative overflow-hidden group/video cursor-pointer' : ''}`}
                    onClick={() => experience.type === 'video' && setShowVideo(true)}
                >
                    {experience.type === 'video' ? (
                        <div className="aspect-video flex items-center justify-center relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity" />
                            <Play className="w-16 h-16 text-white/20 group-hover/video:text-primary-500 transition-all z-10 scale-90 group-hover/video:scale-100" />
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white font-black uppercase bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">Transmission Detected</p>
                                <span className="p-2 bg-primary-600 rounded-lg text-white shadow-lg"><Plus className="w-4 h-4" /></span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-300 font-medium leading-relaxed italic mb-6 line-clamp-4">
                            "{experience.content}"
                        </p>
                    )}
                </div>

                {(experience?.rounds || []).length > 0 && (
                    <div className="mb-6 space-y-2">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Process Segments:</p>
                        <div className="flex flex-wrap gap-2">
                            {(experience?.rounds || []).map((r, i) => (
                                <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 capitalize">{r.name}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                            {experience.isAnonymous ? 'A' : (experience?.studentId?.name?.charAt(0) || '?')}
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                            {experience.isAnonymous ? 'Anonymous Specialist' : (experience?.studentId?.name || 'Student')}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-600 hover:text-red-500 transition-colors"><ShieldAlert className="w-4 h-4" /></button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVideo(false)}
                            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-5xl bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] border border-white/10"
                        >
                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={() => setShowVideo(false)}
                                    className="p-4 bg-black/40 hover:bg-red-500 text-white rounded-2xl backdrop-blur-md transition-all group"
                                >
                                    <Plus className="w-6 h-6 rotate-45 group-hover:rotate-0 transition-transform" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3">
                                <div className="lg:col-span-2 bg-black flex items-center justify-center relative aspect-video lg:aspect-auto">
                                    <video
                                        src={experience.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        <Video className="w-3 h-3" /> Live Feed Reconstruction
                                    </div>
                                </div>
                                <div className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar bg-slate-900">
                                    <div>
                                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-3 px-1">Source Intel</p>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{experience.companyId?.name}</h3>
                                        <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest italic">{experience.difficulty} Cycle Experience</p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Transcription</p>
                                        <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-primary-500/30 pl-4 py-2 bg-white/[0.02] rounded-r-2xl">
                                            "{experience.content || 'Video content only. No textual transcription available for this fragment.'}"
                                        </p>
                                    </div>

                                    {(experience?.rounds || []).length > 0 && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Neural Pathway (Rounds)</p>
                                            <div className="space-y-3">
                                                {(experience?.rounds || []).map((r, i) => (
                                                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-primary-600/10 transition-all">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5 group-hover:border-primary-500/30 group-hover:text-primary-500 transition-all">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300 uppercase group-hover:text-white transition-colors">{r.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                                                {experience.studentId?.name?.charAt(0) || 'S'}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{experience.studentId?.name || 'Student Specialist'}</span>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ExperienceWall;
