import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Opportunities = () => {
    const { socket } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchOpportunities = async () => {
        try {
            const { data } = await API.get('/opportunities');
            setOpportunities(data || []);
        } catch (err) {
            console.error('Failed to fetch opportunities', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('opportunity:statusUpdated', (data) => {
            setOpportunities(prev => {
                if (!prev) return [];
                if (data.status === 'closed') {
                    return prev.filter(op => op._id !== data.opportunityId);
                }
                return prev.map(op => op._id === data.opportunityId ? { ...op, status: data.status } : op);
            });
        });

        socket.on('new_opportunity', (newOpp) => {
            setOpportunities(prev => [newOpp, ...(prev || [])]);
        });

        return () => {
            socket.off('opportunity:statusUpdated');
            socket.off('new_opportunity');
        };
    }, [socket]);

    const filteredOpportunities = (opportunities || []).filter((op) => {
        const matchesSearch = op.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (op.requiredSkills && (op.requiredSkills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesType = typeFilter === 'all' || op.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Explore Opportunities</h1>
                <p className="text-slate-400">Discover internships and research projects from top companies and faculty members.</p>
            </div>

            <div className="flex flex-col md:row items-center gap-4 mb-10 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by title or skills..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-500 shrink-0" />
                    <select
                        className="bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium cursor-pointer w-full"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="internship">Internships</option>
                        <option value="project">Projects</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    <p className="text-slate-500 font-medium">Loading opportunities...</p>
                </div>
            ) : (filteredOpportunities || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOpportunities.map((op) => (
                        <OpportunityCard key={op._id} opportunity={op} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <p className="text-xl text-slate-400">No opportunities found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Opportunities;
