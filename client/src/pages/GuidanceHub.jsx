import React, { useState } from 'react';
import GuidanceList from '../components/GuidanceList';
import ExperienceList from '../components/ExperienceList';
import ExperienceSubmission from '../components/ExperienceSubmission';
import {
    BookOpen, MessageSquare, Plus, X,
    Shield, Building2, LayoutGrid, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GuidanceHub = () => {
    const [activeTab, setActiveTab] = useState('guidance'); // 'guidance' or 'experiences'
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-600/10 rounded-lg">
                            <Zap className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Hub v2.0</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Guidance & <span className="text-emerald-500 text-outline">Experiences</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-sm uppercase font-bold tracking-tight leading-relaxed">
                        Access specialized practice materials deployed by corporate partners and faculty, or explore verified hiring cycle logs from your peers.
                    </p>
                </div>

                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('guidance')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'guidance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <BookOpen className="w-4 h-4" /> Company Guidance
                    </button>
                    <button
                        onClick={() => setActiveTab('experiences')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'experiences' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Student Experiences
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'guidance' ? (
                        <motion.div
                            key="guidance"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <GuidanceList />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="experiences"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="flex items-center justify-between group">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Verified Feedback Logs</h2>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Real-world interview and internship data points.</p>
                                </div>
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="px-6 py-3 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-emerald-500/20"
                                >
                                    <Plus className="w-4 h-4" /> Submit Experience
                                </button>
                            </div>
                            <ExperienceList />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Submission Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSubmitModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Submit Experience Log</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Share your journey with the community.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <ExperienceSubmission onComplete={() => setShowSubmitModal(false)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuidanceHub;
