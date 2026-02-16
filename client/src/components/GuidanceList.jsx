import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
    FileText, Video, ExternalLink, Shield,
    Download, Play, BookOpen, Clock,
    Building2, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const GuidanceList = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const { data } = await API.get('/practice/student');
                setMaterials(data || []);
            } catch (err) {
                console.error('Failed to fetch practice materials', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const getTypeIcon = (type, fileUrl) => {
        if (type === 'link') return <ExternalLink className="w-5 h-5 text-blue-500" />;
        if (type === 'video' || (fileUrl && fileUrl.endsWith('.mp4'))) return <Video className="w-5 h-5 text-purple-500" />;
        return <FileText className="w-5 h-5 text-red-500" />;
    };

    if (loading) return <div className="py-20 text-center"><p className="text-slate-500 animate-pulse">Synchronizing repository...</p></div>;

    const groupedByCompany = (materials || []).reduce((acc, m) => {
        const key = m.role === 'company'
            ? (m.uploadedBy?.companyProfile?.companyName || m.uploadedBy?.name || 'Partner Company')
            : 'Faculty Guidance';
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
    }, {});

    return (
        <div className="space-y-12">
            {Object.keys(groupedByCompany).length > 0 ? Object.entries(groupedByCompany).map(([company, items]) => (
                <div key={company} className="space-y-6">
                    <div className="flex items-center gap-3">
                        {company === 'Faculty Guidance' ? <Shield className="w-6 h-6 text-emerald-500" /> : <Building2 className="w-6 h-6 text-primary-500" />}
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{company}</h2>
                        <div className="h-px flex-1 bg-white/5 ml-4" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(items || []).map((m) => (
                            <motion.div
                                key={m._id}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl">
                                            {getTypeIcon(m.type, m.fileUrl)}
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-slate-500 uppercase tracking-widest">
                                            {m.type}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-white text-base mb-2">{m.title}</h4>
                                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 uppercase font-bold">{m.description || 'No detailed briefing provided.'}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(m.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <a
                                        href={m.type === 'link' ? m.fileUrl : `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${m.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        {m.type === 'video' ? <><Play className="w-3.5 h-3.5" /> Watch Stream</> : <><Download className="w-3.5 h-3.5" /> Access Protocol</>}
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center glass-card border-dashed border-white/5">
                    <p className="text-slate-600 font-black uppercase tracking-widest italic text-sm">No specialized guidance nodes detected.</p>
                </div>
            )}
        </div>
    );
};

export default GuidanceList;
