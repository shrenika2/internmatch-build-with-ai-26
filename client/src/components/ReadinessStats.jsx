import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { motion } from 'framer-motion';
import {
    Target, TrendingUp, AlertTriangle,
    CheckCircle2, BookOpen, Loader2
} from 'lucide-react';

const ReadinessStats = ({ compact = false }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReadiness = async () => {
            try {
                const { data } = await API.get(`/practice/readiness/${user._id}`);
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'student') {
            fetchReadiness();
        }
    }, [user]);

    if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading Statistics...</div>;
    if (!stats) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center font-black text-white">
                    {stats.readinessScore}%
                </div>
                <div>
                    <p className="text-white font-bold leading-none">Global Rank top 5%</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">Based on {stats.totalAttempts} attempts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-primary-500/20 bg-primary-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <Target className="w-6 h-6 text-primary-400" />
                        <span className="text-2xl font-black text-white">{stats.readinessScore}%</span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Readiness Score</p>
                </div>

                <div className="glass-card p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-black text-white">{stats.accuracy}%</span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Practice Accuracy</p>
                </div>

                <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                        <span className="text-2xl font-black text-white">{stats.totalAttempts}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Questions Solved</p>
                </div>
            </div>

            <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Skill Gap Analysis
                </h3>

                {(stats.skillGaps || []).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(stats.skillGaps || []).map(skill => (
                            <div key={skill} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-slate-300 font-medium">{skill}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <p>You have all the core skills required for current open opportunities!</p>
                    </div>
                )}

                <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                    <p className="text-primary-400 text-sm font-medium">
                        <span className="font-bold">Insight:</span> {stats.insights}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReadinessStats;
