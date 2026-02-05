import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
    Plus, FileText, ExternalLink, Video,
    Trash2, Loader2, Link as LinkIcon,
    Shield, Globe, Users, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PracticeModuleManager = ({ context, contextId }) => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('technical');
    const [contentType, setContentType] = useState('pdf');
    const [url, setUrl] = useState('');
    const [visibility, setVisibility] = useState({ openToAll: true, department: [], batch: [] });

    useEffect(() => {
        fetchModules();
    }, [contextId]);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const endpoint = context === 'company'
                ? `/company/practice/${contextId}`
                : `/faculty/practice`;
            const { data } = await API.get(endpoint);
            setModules(data);
        } catch (err) {
            console.error('Failed to fetch modules', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title,
                description,
                type,
                contentType,
                [contentType === 'link' || contentType === 'video' ? 'externalLink' : 'fileUrl']: url,
                opportunityId: context === 'company' ? contextId : null,
                visibilityRules: visibility
            };

            const endpoint = context === 'company' ? '/company/practice' : '/faculty/practice';
            await API.post(endpoint, payload);

            // Reset form
            setTitle('');
            setDescription('');
            setUrl('');
            setShowAddForm(false);
            fetchModules();
        } catch (err) {
            alert('Failed to post practice module');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeIcon = (mType) => {
        switch (mType) {
            case 'pdf': return <FileText className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            default: return <LinkIcon className="w-5 h-5" />;
        }
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
                        <form onSubmit={handleAddModule} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Module Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="e.g. Advanced DSA Patterns" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Material Type</label>
                                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-bold">
                                        <option value="aptitude">Aptitude</option>
                                        <option value="technical">Technical</option>
                                        <option value="interview">Interview</option>
                                        <option value="coding">Coding</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Content Format</label>
                                    <div className="flex gap-2">
                                        {['pdf', 'link', 'video'].map(f => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => setContentType(f)}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${contentType === f ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">URL / Endpoint</label>
                                    <input required value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 bg-slate-900 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Abort</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                                    {submitting ? 'Initializing Node...' : 'Store in Repository'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.length > 0 ? modules.map((m) => (
                    <div key={m._id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                {getTypeIcon(m.contentType)}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase">{m.title}</h4>
                                <p className="text-[9px] text-slate-500 uppercase font-black">{m.type} • {m.contentType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={m.fileUrl || m.externalLink} target="_blank" rel="noreferrer" className="p-2 bg-white/5 text-slate-600 hover:text-white rounded-lg transition-all">
                                <ExternalLink className="w-4 h-4" />
                            </a>
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
