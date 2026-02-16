import React, { useState } from 'react';
import {
    Save, Plus, Trash2, Github, Linkedin,
    Globe, Code2, GraduationCap, X,
    Link as LinkIcon, Loader2, Sparkles,
    Briefcase, Calendar, FileText, UserCircle,
    Trophy, Terminal, Cpu, ExternalLink, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BranchSelect from '../../components/BranchSelect';
import profileService from './profileService';

const ProfileForm = ({ initialData, onSave, onCancel }) => {
    // 1. SAFE DEFAULT STATE INITIALIZATION (Addressing the crash)
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || initialData?.user?.name || '',
        email: initialData?.user?.email || '',
        location: initialData?.location || '',
        branch: initialData?.branch || '',
        year: initialData?.year || 2,
        collegeId: initialData?.collegeId || '',
        college: initialData?.college || '',
        bio: initialData?.bio || '',
        skills: initialData?.skills || [],
        techStack: initialData?.techStack || [],
        cpProfiles: {
            leetcode: initialData?.cpProfiles?.leetcode || '',
            codeforces: initialData?.cpProfiles?.codeforces || '',
            codechef: initialData?.cpProfiles?.codechef || '',
        },
        links: {
            linkedin: initialData?.links?.linkedin || '',
            github: initialData?.links?.github || '',
            portfolio: initialData?.links?.portfolio || '',
        },
        resumeUrl: initialData?.resumeUrl || '',
        resumeFileUrl: initialData?.resumeFileUrl || '',
        parsedSkills: initialData?.parsedSkills || [],
        // Fix: Normalize dates from backend to YYYY-MM-DD for HTML date inputs
        experiences: (initialData?.experiences || []).map(exp => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
            endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
            isCurrent: exp.isCurrent || false
        }))
    });

    const [skillInput, setSkillInput] = useState('');
    const [techInput, setTechInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [protocolError, setProtocolError] = useState('');

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
        setDateError('');

        // 1. Validate dates before submission to prevent protocol rejection
        for (const exp of formData.experiences) {
            if (!exp.startDate) {
                setProtocolError(`Mission Log: Start Date is required for the role "${exp.title || 'Untitled'}".`);
                return;
            }
            if (!exp.isCurrent && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
                setProtocolError(`Protocol Violation: Start Date cannot be after End Date for the role "${exp.title || 'Untitled'}".`);
                return;
            }
        }

        // 2. Prepare payload - Convert to ISO format as required by Joi/Mongoose protocol
        const submissionData = {
            ...formData,
            experiences: formData.experiences.map(exp => ({
                ...exp,
                startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
                endDate: exp.endDate && !exp.isCurrent ? new Date(exp.endDate).toISOString() : null,
            }))
        };

        // 3. Debug logging for transparency (As per requirement)
        console.log('Final Student Profile Payload Transmission:', submissionData);

        setLoading(true);
        try {
            await onSave(submissionData);
        } catch (err) {
            console.error('Transmission Failure:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-32 max-w-5xl mx-auto overflow-y-visible">
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
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Email (Read Only)</label>
                        <input
                            readOnly
                            className="w-full bg-slate-950/20 border border-white/5 rounded-2xl py-4 px-6 text-slate-500 focus:outline-none transition-all font-bold cursor-not-allowed"
                            value={formData.email}
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
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Institutional Name (College)</label>
                        <input
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold placeholder:text-slate-800"
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            placeholder="e.g. Pune Institute of Computer Technology"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Current Location</label>
                        <input
                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold placeholder:text-slate-800"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Pune, Maharashtra"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Academic Branch</label>
                        <BranchSelect
                            value={formData.branch}
                            onChange={(value) => setFormData({ ...formData, branch: value })}
                        />
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
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Secure Asset Repository</h3>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Professional Resume (PDF/DOCX - Required for AI Matching)</label>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="relative flex-1 w-full">
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${formData.resumeFileUrl ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-slate-950/50 hover:border-primary-500/50'}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setLoading(true);
                                            try {
                                                const uploadData = new FormData();
                                                uploadData.append('file', file);
                                                const res = await profileService.uploadResume(uploadData);

                                                setFormData(prev => ({
                                                    ...prev,
                                                    resumeFileUrl: res.url,
                                                    resumeUrl: res.url,
                                                    parsedSkills: res.skills
                                                }));
                                                alert('Protocol Secured: Resume uploaded and skills parsed successfully.');
                                            } catch (err) {
                                                const msg = err.response?.data?.message || err.message;
                                                setProtocolError(msg);
                                                // If it's a known scan error, provide more context after the error clears or alongside it
                                                if (msg.includes('image-based')) {
                                                    console.warn('Scanned PDF detected. Recommendation: Convert to text-based PDF or DOCX.');
                                                }
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Briefcase className="w-8 h-8 text-slate-500 mb-3" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">
                                            {formData.resumeFileUrl ? 'Resume Decrypted & Stored' : 'Select Resume Signal (PDF/DOCX)'}
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {formData.resumeFileUrl && (
                                <a
                                    href={formData.resumeFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> View Stored Asset
                                </a>
                            )}
                        </div>

                        {formData.parsedSkills && formData.parsedSkills.length > 0 && (
                            <div className="mt-6 p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> AI Extracted Skill Matrix
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.parsedSkills.map(s => (
                                        <span key={s} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/20 rounded-md">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Professional Bio (Impact Synthesis)</label>
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
                            {(formData.skills || []).map(skill => (
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
                            {(formData.techStack || []).map(tech => (
                                <span key={tech} className="px-3 py-1.5 bg-slate-800 text-slate-300 border border-white/5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                                    {tech}
                                    <button type="button" onClick={() => handleRemoveTag('techStack', tech)}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Connectivity (Links) */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600/20 rounded-2xl">
                        <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Social Connectivity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">LinkedIn Intelligence</label>
                        <div className="relative">
                            <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-800"
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
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-bold placeholder:text-slate-800"
                                value={formData.links.github}
                                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                                placeholder="github.com/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Personal Portfolio</label>
                        <div className="relative">
                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold placeholder:text-slate-800"
                                value={formData.links.portfolio}
                                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, portfolio: e.target.value } })}
                                placeholder="portfolio-v3.dev"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Coding Intelligence Hub (CP Profiles) */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-600/20 rounded-2xl">
                        <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Coding Intelligence Hub</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">LeetCode Username/URL</label>
                        <div className="relative">
                            <Code2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-bold placeholder:text-slate-800"
                                value={formData.cpProfiles.leetcode}
                                onChange={(e) => setFormData({ ...formData, cpProfiles: { ...formData.cpProfiles, leetcode: e.target.value } })}
                                placeholder="leetcode.com/username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Codeforces Username</label>
                        <div className="relative">
                            <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all font-bold placeholder:text-slate-800"
                                value={formData.cpProfiles.codeforces}
                                onChange={(e) => setFormData({ ...formData, cpProfiles: { ...formData.cpProfiles, codeforces: e.target.value } })}
                                placeholder="codeforces.com/profile/username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">CodeChef ID</label>
                        <div className="relative">
                            <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                            <input
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all font-bold placeholder:text-slate-800"
                                value={formData.cpProfiles.codechef}
                                onChange={(e) => setFormData({ ...formData, cpProfiles: { ...formData.cpProfiles, codechef: e.target.value } })}
                                placeholder="codechef.com/users/username"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Experience Timeline */}
            <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600/20 rounded-2xl">
                            <Briefcase className="w-6 h-6 text-emerald-500" />
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
                    {(formData.experiences || []).map((exp, idx) => (
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
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                        placeholder="Software Intern"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Company / Entity</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                        placeholder="Hyper-growth Startup"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all [color-scheme:dark]"
                                        value={exp.startDate}
                                        onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">End Date</label>
                                    <div className="space-y-3">
                                        <input
                                            type="date"
                                            disabled={exp.isCurrent}
                                            className={`w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all [color-scheme:dark] ${exp.isCurrent ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            value={exp.isCurrent ? '' : exp.endDate}
                                            onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                            <input
                                                type="checkbox"
                                                checked={exp.isCurrent}
                                                onChange={(e) => handleExperienceChange(idx, 'isCurrent', e.target.checked)}
                                                className="w-4 h-4 rounded border-white/10 bg-slate-950 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 transition-colors uppercase">Active Deployment (Current Role)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Key Responsibilities & Impact</label>
                                    <textarea
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-slate-300 font-medium h-32 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
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

            {/* Error Message Protocol */}
            <AnimatePresence>
                {protocolError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={() => setProtocolError('')}
                        className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-red-600/90 backdrop-blur-xl border border-red-500/50 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer max-w-md"
                    >
                        <X className="w-4 h-4 text-white flex-shrink-0" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider leading-relaxed">{protocolError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

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
