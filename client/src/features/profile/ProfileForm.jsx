import React, { useState } from 'react';
import {
    Save, Plus, Trash2, Github, Linkedin,
    Globe, Code2, GraduationCap, X,
    Link as LinkIcon, Loader2, Sparkles,
    Briefcase, Calendar, FileText, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        fullName: '',
        branch: '',
        year: 2,
        collegeId: '',
        bio: '',
        skills: [],
        techStack: [],
        cpProfiles: { leetcode: '', codeforces: '', codechef: '' },
        links: { linkedin: '', github: '', portfolio: '' },
        resumeUrl: '',
        experiences: []
    });

    const [skillInput, setSkillInput] = useState('');
    const [techInput, setTechInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddExperience = () => {
        setFormData({
            ...formData,
            experiences: [
                ...formData.experiences,
                { title: '', company: '', description: '', startDate: '', endDate: '', isCurrent: false }
            ]
        });
    };

    const handleExperienceChange = (index, field, value) => {
        const newExps = [...formData.experiences];
        newExps[index][field] = value;
        setFormData({ ...formData, experiences: newExps });
    };

    const handleRemoveExperience = (index) => {
        setFormData({
            ...formData,
            experiences: formData.experiences.filter((_, i) => i !== index)
        });
    };

    const handleAddTag = (type, value) => {
        if (!value.trim()) return;
        if (formData[type].includes(value.trim())) {
            if (type === 'skills') setSkillInput('');
            else setTechInput('');
            return;
        }
        setFormData({
            ...formData,
            [type]: [...formData[type], value.trim()]
        });
        if (type === 'skills') setSkillInput('');
        else setTechInput('');
    };

    const handleRemoveTag = (type, value) => {
        setFormData({
            ...formData,
            [type]: formData[type].filter(t => t !== value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-20 max-w-5xl mx-auto">
            {/* Header / Professional Identity */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary-600/20 rounded-2xl">
                        <UserCircle className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Core Identity Node</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Legal Full Name</label>
                        <input
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold placeholder:text-slate-800"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. Alexander Pierce"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Institutional Identification (ID)</label>
                        <input
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold placeholder:text-slate-800"
                            value={formData.collegeId}
                            onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                            placeholder="PICT-202X-XXX"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Academic Branch</label>
                        <select
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold"
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        >
                            <option value="">Select Branch</option>
                            <option value="Computer Engineering">Computer Engineering</option>
                            <option value="IT">Information Technology</option>
                            <option value="EnTC">Electronics & Telecommunication</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Active Academic Year</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(y => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, year: y })}
                                    className={`py-3 rounded-xl text-xs font-black transition-all ${formData.year === y ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                                >
                                    Y{y}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Resume & Bio */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-600/20 rounded-2xl">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Asset & Bio Stream</h3>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Professional Resume URL (Google Drive / S3)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                required
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold"
                                value={formData.resumeUrl}
                                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                placeholder="https://drive.google.com/file/d/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Professional Bio (Max 500 chars)</label>
                        <textarea
                            className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-8 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm min-h-[160px]"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Synthesize your professional journey into a high-impact narrative..."
                        />
                    </div>
                </div>
            </section>

            {/* Skills & Tech Stack */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-600/20 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Skillset Matrix</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Primary Proficiencies</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('skills', skillInput))}
                                placeholder="e.g. Data Analysis"
                            />
                            <button type="button" onClick={() => handleAddTag('skills', skillInput)} className="p-3 bg-primary-600 text-white rounded-xl"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map(skill => (
                                <span key={skill} className="px-3 py-1.5 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                                    {skill}
                                    <button type="button" onClick={() => handleRemoveTag('skills', skill)}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Core Tech Stack</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('techStack', techInput))}
                                placeholder="e.g. React, Node.js"
                            />
                            <button type="button" onClick={() => handleAddTag('techStack', techInput)} className="p-3 bg-primary-600 text-white rounded-xl"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.techStack.map(tech => (
                                <span key={tech} className="px-3 py-1.5 bg-slate-800 text-slate-300 border border-white/5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                                    {tech}
                                    <button type="button" onClick={() => handleRemoveTag('techStack', tech)}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Professional Connectivity */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600/20 rounded-2xl">
                        <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Connectivity Nodes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">LinkedIn Intelligence</label>
                        <div className="relative">
                            <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                value={formData.links.linkedin}
                                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })}
                                placeholder="linkedin.com/in/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">GitHub Repository</label>
                        <div className="relative">
                            <Github className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-bold"
                                value={formData.links.github}
                                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                                placeholder="github.com/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Portfolio (Web Hub)</label>
                        <div className="relative">
                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                                value={formData.links.portfolio}
                                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, portfolio: e.target.value } })}
                                placeholder="portfolio-v3.dev"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Experience Timeline */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-600/20 rounded-2xl">
                            <Briefcase className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mission Log (Experiences)</h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddExperience}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-500 bg-primary-600/10 px-4 py-2.5 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-lg shadow-primary-600/10"
                    >
                        <Plus className="w-4 h-4" /> Add Experience Log
                    </button>
                </div>

                <div className="space-y-6">
                    {formData.experiences.map((exp, idx) => (
                        <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] relative group animate-in slide-in-from-right-4">
                            <button
                                type="button"
                                onClick={() => handleRemoveExperience(idx)}
                                className="absolute top-8 right-8 p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Role / Designation</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                        placeholder="Software Intern"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Company / Entity</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                        placeholder="Hyper-growth Startup"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Key Responsibilities & Impact</label>
                                    <textarea
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-slate-300 font-medium h-32"
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                        placeholder="Detail your contributions and technical achievements..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Submission Logic */}
            <div className="fixed bottom-12 left-1/2 -translate-x-[calc(50%-48px)] flex gap-4 z-40 bg-slate-950/80 backdrop-blur-3xl p-3 border border-white/10 rounded-[2.5rem] shadow-3xl shadow-black">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-10 py-5 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-[0.2em] flex items-center gap-3"
                >
                    <X className="w-5 h-5" /> Abort Changes
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl shadow-primary-600/30 active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Commit Profile</>}
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;
