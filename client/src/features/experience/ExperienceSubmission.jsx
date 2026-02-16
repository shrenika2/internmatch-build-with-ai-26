import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import {
    X, Send, Video, MessageSquare,
    Star, ArrowRight, Plus, Trash2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ExperienceSubmission = ({ onClose, onSuccess }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyId: '',
        type: 'text',
        content: '',
        videoUrl: '',
        difficulty: 'Medium',
        rating: 5,
        rounds: [{ name: '', description: '' }],
        tips: '',
        isAnonymous: false
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const { data } = await API.get('/admin/users'); // For now fetch all users and filter companies
            setCompanies(Array.isArray(data) ? data.filter(u => u.role === 'company') : []);
        } catch (err) {
            console.error(err);
        }
    };

    const addRound = () => {
        setFormData({ ...formData, rounds: [...formData.rounds, { name: '', description: '' }] });
    };

    const removeRound = (index) => {
        const newRounds = formData.rounds.filter((_, i) => i !== index);
        setFormData({ ...formData, rounds: newRounds });
    };

    const updateRound = (index, field, value) => {
        const newRounds = [...formData.rounds];
        newRounds[index][field] = value;
        setFormData({ ...formData, rounds: newRounds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/experience', formData);
            onSuccess();
        } catch (err) {
            alert('Failure in transmission: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl no-scrollbar"
            >
                <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-8 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">New Intel Transmission</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Upload recruitment cycle logs to the student network.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Company Entity</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none font-bold"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                >
                                    <option value="">Select Target Entity</option>
                                    {(companies || []).map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Transmission Medium</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'text' })}
                                        className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${formData.type === 'text' ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-600/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase">Encrypted Text</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'video' })}
                                        className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${formData.type === 'video' ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-600/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                                    >
                                        <Video className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase">Video Signal</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Cycle Difficulty</label>
                                <div className="flex gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, difficulty: d })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.difficulty === d ? 'bg-slate-700 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-600'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Experience Rating</label>
                                <div className="flex gap-3 px-1">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: v })}
                                            className={`p-2 transition-transform hover:scale-125 ${v <= formData.rating ? 'text-amber-500' : 'text-slate-800'}`}
                                        >
                                            <Star className={`w-6 h-6 ${v <= formData.rating ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Intel Content</label>
                        {formData.type === 'text' ? (
                            <textarea
                                className="w-full bg-slate-800 border border-white/5 rounded-3xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[160px] font-medium placeholder:text-slate-700"
                                placeholder="Describe the interview experience, environment, and overall vibe..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        ) : (
                            <div className="relative">
                                <Video className="absolute left-6 top-6 w-5 h-5 text-slate-600" />
                                <input
                                    type="url"
                                    placeholder="Transmission link (YouTube, Drive...)"
                                    className="w-full bg-slate-800 border border-white/5 rounded-3xl py-6 pl-16 pr-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-medium placeholder:text-slate-700"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                />
                            </div>
                        )}
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interview Rounds Segmented</label>
                            <button type="button" onClick={addRound} className="flex items-center gap-2 text-primary-500 text-[10px] font-black uppercase hover:text-primary-400 transition-colors">
                                <Plus className="w-4 h-4" /> Add Segment
                            </button>
                        </div>
                        <div className="space-y-4">
                            {(formData.rounds || []).map((round, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 p-4 bg-white/5 rounded-2xl items-start relative border border-white/5">
                                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">{idx + 1}</span>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            placeholder="Segment Name (e.g. DSA)"
                                            className="bg-transparent border-b border-white/10 text-white p-2 text-sm focus:outline-none focus:border-primary-500 font-bold"
                                            value={round.name}
                                            onChange={(e) => updateRound(idx, 'name', e.target.value)}
                                        />
                                        <input
                                            placeholder="Key Takeaways..."
                                            className="md:col-span-2 bg-transparent border-b border-white/10 text-white p-2 text-sm focus:outline-none focus:border-primary-500 font-medium"
                                            value={round.description}
                                            onChange={(e) => updateRound(idx, 'description', e.target.value)}
                                        />
                                    </div>
                                    {(formData.rounds?.length || 0) > 1 && (
                                        <button type="button" onClick={() => removeRound(idx)} className="text-slate-700 hover:text-red-500 transition-colors p-2"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Strategic Advice for Juniors</label>
                        <textarea
                            className="w-full bg-slate-800 border border-white/5 rounded-2xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[100px] font-medium"
                            placeholder="Share specific preparation tips or warnings..."
                            value={formData.tips}
                            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                        />
                    </section>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-6 h-6 bg-slate-800 border-white/10 rounded-lg text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-900 focus:ring-offset-2"
                                checked={formData.isAnonymous}
                                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase">Mask Identity (Anonymous Mode)</span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-16 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Initiate Uplink</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ExperienceSubmission;
