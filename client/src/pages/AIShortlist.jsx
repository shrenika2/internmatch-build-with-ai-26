import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { motion } from 'framer-motion';
import {
    Users, Award, Zap, Brain,
    CheckCircle, XCircle, Loader2, ChevronLeft,
    ExternalLink, Mail
} from 'lucide-react';

const AIShortlist = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opportunity, setOpportunity] = useState(null);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [oppRes, shortlistRes] = await Promise.all([
                API.get(`/opportunities/${id}`),
                API.get(`/company/opportunities/${id}/shortlist`)
            ]);
            setOpportunity(oppRes.data || null);
            setCandidates(shortlistRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        setProcessing(applicationId);
        try {
            await API.post(`/company/opportunities/${id}/select`, { applicationId, status });
            setCandidates(prev => (prev || []).map(c =>
                c.applicationId === applicationId ? { ...c, status } : c
            ));
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition-colors"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1" />
                Back to Dashboard
            </button>

            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-bold text-white">AI-Assisted Shortlisting</h1>
                </div>
                <p className="text-slate-400">
                    Ranked view of <strong>{opportunity?.title}</strong> applicants based on skills, practice activity, and readiness.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(candidates || []).map((candidate, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={candidate.applicationId}
                        className={`glass-card p-6 border-l-4 ${candidate.status === 'shortlisted' ? 'border-l-green-500' :
                            candidate.status === 'rejected' ? 'border-l-red-500' : 'border-l-primary-500/50'
                            }`}
                    >
                        <div className="flex flex-col lg:row lg:items-center justify-between gap-8">
                            {/* User Info */}
                            <div className="flex items-center gap-4 min-w-[300px]">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black text-primary-500 border border-white/5">
                                    {candidate.student?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{candidate.student?.name || 'Student Candidate'}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                        <Mail className="w-3 h-3" />
                                        {candidate.student?.email || 'N/A'}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(candidate.matchedSkills || []).map(skill => (
                                            <span key={skill} className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Stats & Scores */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 border-x border-white/5">
                                {[
                                    { label: 'Rank Score', val: candidate.scores?.rankScore || 0, icon: Zap, color: 'text-yellow-400' },
                                    { label: 'Skill Match', val: candidate.scores?.skillMatchScore || 0, icon: Award, color: 'text-primary-400' },
                                    { label: 'Readiness', val: candidate.scores?.readinessScore || 0, icon: Brain, color: 'text-purple-400' },
                                    { label: 'Activity', val: candidate.scores?.practiceScore || 0, icon: Users, color: 'text-green-400' },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className={`flex items-center justify-center gap-1 mb-1 font-black text-lg ${stat.color}`}>
                                            <stat.icon className="w-4 h-4" />
                                            {stat.val}%
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-nowrap">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 shrink-0">
                                <button
                                    onClick={() => handleStatusUpdate(candidate.applicationId, 'rejected')}
                                    disabled={processing === candidate.applicationId || candidate.status === 'rejected'}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    title="Reject"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(candidate.applicationId, 'shortlisted')}
                                    disabled={processing === candidate.applicationId || candidate.status === 'shortlisted'}
                                    className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50"
                                    title="Shortlist"
                                >
                                    <CheckCircle className="w-6 h-6" />
                                </button>
                                <div className="h-12 w-px bg-white/5" />
                                <button
                                    onClick={() => navigate(`/company/student-profile/${candidate.student?.id || candidate.student?._id}`)}
                                    className="bg-slate-800 p-3 rounded-xl text-white hover:bg-slate-700 transition-all flex items-center gap-2 font-bold text-sm"
                                >
                                    View Profile <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AIShortlist;
