import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import {
    Map, Compass, BookOpen, UserCheck,
    ChevronRight, ExternalLink, Download,
    GraduationCap, Building2, Users, Star,
    CheckCircle2, Target, Zap, Clock, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GuidanceHub = () => {
    const [activeTab, setActiveTab] = useState('roadmaps');

    const tabs = [
        { id: 'roadmaps', label: 'Protocol Roadmaps', icon: Map },
        { id: 'prep', label: 'Company Blueprints', icon: Target },
        { id: 'faculty', label: 'Faculty Archives', icon: GraduationCap },
        { id: 'peer', label: 'Peer Intel', icon: Users }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Neural Guidance Center</h2>
                    <p className="text-slate-500 font-medium italic">Curated knowledge packets for strategic career advancement.</p>
                </div>
            </header>

            <div className="flex bg-slate-900/40 p-1.5 rounded-[2rem] border border-white/5 w-fit mb-12">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'roadmaps' && <RoadmapsSection key="roadmaps" />}
                    {activeTab === 'prep' && <CompanyPrepSection key="prep" />}
                    {activeTab === 'faculty' && <FacultyPicksSection key="faculty" />}
                    {activeTab === 'peer' && <PeerAdviceSection key="peer" />}
                </AnimatePresence>
            </div>
        </div>
    );
};

const RoadmapsSection = () => {
    const roadmaps = [
        { title: 'Frontend Systems', status: 'In Progress', progress: 65, color: 'text-blue-400', level: 'Advanced' },
        { title: 'Backend Architecture', status: 'Locked', progress: 0, color: 'text-purple-400', level: 'Intermediate' },
        { title: 'ML/AI Engine', status: 'Locked', progress: 0, color: 'text-emerald-400', level: 'Hard' },
        { title: 'Core DSA Protocol', status: 'Completed', progress: 100, color: 'text-amber-400', level: 'Fundamental' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmaps.map(rm => (
                <div key={rm.title} className="glass-card p-8 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between group">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg ${rm.color}`}>{rm.level}</span>
                            <div className="p-2 bg-white/5 rounded-lg"><Zap className={`w-4 h-4 ${rm.color}`} /></div>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-primary-400 transition-colors">{rm.title}</h4>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase">{rm.status}</span>
                            <span className="text-[10px] font-black text-white uppercase">{rm.progress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600" style={{ width: `${rm.progress}%` }} />
                        </div>
                        <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Initialize Route</button>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

const CompanyPrepSection = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {['Google Cloud', 'Amazon SDE', 'Microsoft Azure', 'Atlassian Engineering'].map(company => (
                    <div key={company} className="glass-card p-10 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group border-l-4 border-l-primary-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-primary-400 transition-colors">{company} Preparation Protocol</h4>
                                <p className="text-sm text-slate-500 font-medium italic mb-8">Comprehensive guide focusing on distributed systems and architectural patterns.</p>

                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                        <BookOpen className="w-3.5 h-3.5 text-primary-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">12 Modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                        <Clock className="w-3.5 h-3.5 text-primary-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">18h Estimate</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                        <Target className="w-3.5 h-3.5 text-primary-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">86% Readiness Threshold</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all shadow-xl shadow-primary-600/20"><ChevronRight className="w-6 h-6" /></button>
                        </div>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <p className="text-[10px] text-emerald-500 font-black uppercase flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Curated by industry veterans and passed peers.</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const FacultyPicksSection = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Advanced OS', 'System Design Patterns', 'Ethical AI & Governance'].map(title => (
                <div key={title} className="glass-card p-0 overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col group">
                    <div className="h-40 bg-slate-950 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-600/10 opacity-50" />
                        <BookOpen className="w-16 h-16 text-white/5 group-hover:scale-110 group-hover:text-primary-500 opacity-20 transition-all" />
                    </div>
                    <div className="p-8 space-y-4">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded-lg">Faculty Resource</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-primary-400 transition-colors uppercase">{title}</h4>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase uppercase">Dr. Sharma, Dept. CS</span>
                            <button className="text-slate-500 hover:text-white p-2 transition-colors"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

const PeerAdviceSection = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-8 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-slate-500 group-hover:text-primary-400 transition-colors" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">How I cracked the Amazon SDE-1 Interview</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Shared by <span className="text-primary-400">Rohan Das</span> • 3 days ago</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase rounded-lg border border-amber-500/20">Hot Content</span>
                                    <button className="text-slate-500 hover:text-white p-1 transition-colors"><Bookmark className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed italic">"Focus heavily on behavioral questions (Star Method) and graph algorithms. The system design round for the intern profile was unexpectedly detailed..."</p>
                            <div className="flex items-center mt-2.5 gap-4">
                                <span className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Community Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default GuidanceHub;
