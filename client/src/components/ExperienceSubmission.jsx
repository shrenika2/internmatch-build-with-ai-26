import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
    Send, Video, MessageSquare, AlertCircle,
    CheckCircle, Shield, User, EyeOff, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExperienceSubmission = ({ onComplete }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [companyId, setCompanyId] = useState('');
    const [type, setType] = useState('text');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const { data } = await API.get('/opportunities');
                const uniqueCompanies = [];
                const seen = new Set();
                data.forEach(opp => {
                    if (opp.postedBy && !seen.has(opp.postedBy._id)) {
                        seen.add(opp.postedBy._id);
                        uniqueCompanies.push(opp.postedBy);
                    }
                });
                setCompanies(uniqueCompanies);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/experience', {
                companyId,
                type,
                content: type === 'text' ? content : undefined,
                videoUrl: type === 'video' ? videoUrl : undefined,
                isAnonymous
            });
            setSuccess(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 2000);
        } catch (err) {
            alert('Failed to submit experience');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-600/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Log Transmitted</h2>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Your experience has been sent for moderation. Thank you for contributing to the grid.</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Target Entity</label>
                    <select
                        required
                        value={companyId}
                        onChange={e => setCompanyId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white uppercase font-bold focus:border-emerald-500 transition-all outline-none"
                    >
                        <option value="">Choose Company</option>
                        {companies.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media Type</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setType('text')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'text' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                            <MessageSquare className="w-3.5 h-3.5" /> Text Log
                        </button>
                        <button type="button" onClick={() => setType('video')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'video' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                            <Video className="w-3.5 h-3.5" /> Video Log
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {type === 'text' ? 'Experience Briefing' : 'Video URL (MP4 Only)'}
                </label>
                {type === 'text' ? (
                    <textarea
                        required
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-xs text-white placeholder-slate-700 min-h-[150px] focus:border-emerald-500 transition-all outline-none"
                        placeholder="Detail your interview process, internship experience, or hiring feedback..."
                    />
                ) : (
                    <input
                        required
                        type="url"
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:border-emerald-500 transition-all outline-none"
                        placeholder="https://example.com/experience.mp4"
                    />
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                    <EyeOff className="w-5 h-5 text-slate-500" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Anonymize Broadcast</p>
                        <p className="text-[9px] text-slate-600 uppercase font-black">Hide your identity from public logs</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isAnonymous ? 'bg-emerald-600' : 'bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnonymous ? 'right-1' : 'left-1'}`} />
                </button>
            </div>

            <div className="flex items-center gap-2 text-amber-500/50 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[9px] font-black uppercase tracking-widest">All entries are subject to moderation before grid deployment.</p>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Finalize Submission</>}
            </button>
        </form>
    );
};

export default ExperienceSubmission;
