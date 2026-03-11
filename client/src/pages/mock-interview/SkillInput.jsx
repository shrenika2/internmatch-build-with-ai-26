import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, PlayCircle, ChevronLeft } from 'lucide-react';

const SkillInput = () => {
    const navigate = useNavigate();
    const [jobRole, setJobRole] = useState('');
    const [experience, setExperience] = useState('');

    const handleStart = (e) => {
        e.preventDefault();
        // In a real app we would pass these via state or context
        navigate('/student/mock-interview/live', { state: { jobRole, experience } });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/student/arena/default')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition-colors"
                type="button"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Arena
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 md:p-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

                <h1 className="text-3xl font-black text-white mb-2">Configure AI Interview</h1>
                <p className="text-slate-400 mb-8">
                    Provide the role and experience level you are targeting so the AI can generate tailored technical and behavioral questions.
                </p>

                <form onSubmit={handleStart} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Target Job Role / Position
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g. Frontend Engineer, Data Analyst"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            Years of Experience
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <select
                                required
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
                            >
                                <option value="" disabled>Select experience level</option>
                                <option value="0">Fresher / 0 years</option>
                                <option value="1">1-2 years</option>
                                <option value="3">3-5 years</option>
                                <option value="5+">5+ years</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={!jobRole || !experience}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${!jobRole || !experience
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20'
                                }`}
                        >
                            <PlayCircle className="w-5 h-5" /> Start Neural Interview
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SkillInput;
