import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { motion } from 'framer-motion';
import {
    Briefcase, Calendar, MapPin, Target,
    FileText, Zap, ChevronRight, Loader2, ArrowLeft
} from 'lucide-react';
import BranchSelect from '../components/BranchSelect';


const PostOpportunity = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'internship',
        description: '',
        location: '',
        duration: '',
        stipend: '',
        deadline: '',
        requiredSkills: '',
        facultyApprovalRequired: false,
        eligibilityCriteria: {
            minYear: '',
            branch: ''
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
                branch: formData.eligibilityCriteria.branch
            };
            await API.post('/opportunities', dataToSubmit);
            navigate('/company/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#050505] text-slate-300 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors mb-8 font-black uppercase text-xs tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Base
                </button>

                <div className="mb-12">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Initialize Opportunity</h1>
                    <p className="text-slate-500 italic font-medium">Deploy a new Internship or Project node to the student grid.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Identity */}
                    <div className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <h3 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Briefcase className="w-4 h-4" /> Opportunity Parameters
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Deployment Title</label>
                                <input
                                    required
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    placeholder="e.g. Senior Frontend Architect"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Engagement Logic</label>
                                <select
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="internship">Internship (Full-Time)</option>
                                    <option value="project">Project (Contractual)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Deployment Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        required
                                        className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                        placeholder="Remote / Mumbai / On-site"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Initialization Duration</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        required
                                        className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                        placeholder="e.g. 6 Months"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logic & Requirements */}
                    <div className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <h3 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Target className="w-4 h-4" /> Required Tech Stack
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Resource Skills (Comma Separated)</label>
                                <div className="relative">
                                    <Zap className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                    <textarea
                                        required
                                        className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium h-32"
                                        placeholder="React, AWS, Node.js, TypeScript..."
                                        value={formData.requiredSkills}
                                        onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Target Year</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                        placeholder="Min Year (e.g. 3)"
                                        value={formData.eligibilityCriteria.minYear}
                                        onChange={e => setFormData({
                                            ...formData,
                                            eligibilityCriteria: { ...formData.eligibilityCriteria, minYear: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Eligible Branch</label>
                                    <BranchSelect
                                        value={formData.eligibilityCriteria.branch}
                                        onChange={value => setFormData({
                                            ...formData,
                                            eligibilityCriteria: { ...formData.eligibilityCriteria, branch: value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Finalization */}
                    <div className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Stipend Allocation</label>
                                <input
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    placeholder="e.g. ₹25,000 / Month"
                                    value={formData.stipend}
                                    onChange={e => setFormData({ ...formData, stipend: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Expiration Deadline</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Deployment Description</label>
                                <textarea
                                    required
                                    className="w-full bg-[#080808] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium h-48"
                                    placeholder="Full details about the role and responsibilities..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-white uppercase mb-1">Academic Oversight Required?</h4>
                                    <p className="text-[10px] text-slate-500">If enabled, this position will require validation from the college faculty before going live.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-8 h-8 rounded-lg bg-[#080808] border-white/5 text-emerald-600 focus:ring-emerald-500"
                                    checked={formData.facultyApprovalRequired}
                                    onChange={e => setFormData({ ...formData, facultyApprovalRequired: e.target.checked })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-4 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            Deploy Node to Global Grid
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostOpportunity;
