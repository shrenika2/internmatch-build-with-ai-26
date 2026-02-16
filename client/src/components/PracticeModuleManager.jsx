import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
    Plus, FileText, ExternalLink, Video,
    Trash2, Loader2, Link as LinkIcon,
    Shield, Globe, Users, Briefcase,
    UploadCloud, CheckCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PracticeModuleManager = ({ context, contextId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pdf');
    const [sourceType, setSourceType] = useState('file'); // 'file' or 'link'
    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);
    const [visibility, setVisibility] = useState('public');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        fetchMaterials();
    }, [contextId, context]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const endpoint = context === 'company'
                ? `/practice/company-specific/${userInfo._id}`
                : `/practice/faculty-specific/${userInfo._id}`;
            const { data } = await API.get(endpoint);
            setMaterials(data || []);
        } catch (err) {
            console.error('Failed to fetch materials', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            formData.append('visibility', visibility);

            if (context === 'company' && contextId) {
                formData.append('linkedOpportunity', contextId);
            }

            if (sourceType === 'file') {
                if (!file) throw new Error('Please select a file');
                formData.append('file', file);
            } else {
                formData.append('link', link);
                formData.append('type', 'link');
            }

            await API.post('/practice/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            // Reset form
            setTitle('');
            setDescription('');
            setLink('');
            setFile(null);
            setShowAddForm(false);
            fetchMaterials();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to upload material');
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await API.delete(`/practice/material/${id}`);
            setMaterials((materials || []).filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete material');
        }
    };

    const getTypeIcon = (mType, fileUrl) => {
        if (mType === 'link') return <LinkIcon className="w-5 h-5 text-blue-500" />;
        if (mType === 'video' || (fileUrl && fileUrl.endsWith('.mp4'))) return <Video className="w-5 h-5 text-purple-500" />;
        if (mType === 'pdf' || (fileUrl && fileUrl.endsWith('.pdf'))) return <FileText className="w-5 h-5 text-red-500" />;
        return <FileText className="w-5 h-5 text-emerald-500" />;
    };

    if (loading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Secure Practice Repository
                </h3>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" /> Deploy Material
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5"
                    >
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Material Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="e.g. Advanced DSA Patterns" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Visibility</label>
                                    <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-bold">
                                        <option value="public">Open to All Students</option>
                                        <option value="applicants_only">Applicants Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="What should students learn from this?" rows="2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Source Type</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setSourceType('file')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceType === 'file' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500'}`}>Local File</button>
                                        <button type="button" onClick={() => setSourceType('link')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceType === 'link' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500'}`}>External Link</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {sourceType === 'file' ? (
                                        <>
                                            <label className="text-[10px] font-black text-slate-500 uppercase">Upload PDF/Video</label>
                                            <div className="relative">
                                                <input type="file" accept=".pdf,.mp4" onChange={e => {
                                                    setFile(e.target.files[0]);
                                                    setType(e.target.files[0]?.name.endsWith('.pdf') ? 'pdf' : 'video');
                                                }} className="hidden" id="file-upload" />
                                                <label htmlFor="file-upload" className="w-full bg-slate-950 border border-dashed border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-pointer flex items-center justify-center gap-2 hover:border-emerald-500/50 transition-all">
                                                    {file ? file.name : <><UploadCloud className="w-4 h-4" /> Choose File</>}
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label className="text-[10px] font-black text-slate-500 uppercase">External URL</label>
                                            <input required value={link} onChange={e => setLink(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="https://..." />
                                        </>
                                    )}
                                </div>
                            </div>

                            {submitting && uploadProgress > 0 && (
                                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 bg-slate-900 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Abort</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                                    {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Storing...</> : 'Store in Repository'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(materials || []).length > 0 ? (materials || []).map((m) => (
                    <div key={m._id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                {getTypeIcon(m.type, m.fileUrl)}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase">{m.title}</h4>
                                <p className="text-[9px] text-slate-500 uppercase font-black">{m.type} • {m.visibility === 'public' ? 'Public' : 'Applicants Only'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={m.type === 'link' ? m.fileUrl : `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${m.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-white/5 text-slate-600 hover:text-white rounded-lg transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => handleDelete(m._id)}
                                className="p-2 bg-white/5 text-slate-600 hover:text-red-500 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 py-10 text-center glass-card border-dashed border-white/5">
                        <p className="text-slate-600 text-[11px] font-black uppercase tracking-widest italic">No practice protocols deployed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeModuleManager;
