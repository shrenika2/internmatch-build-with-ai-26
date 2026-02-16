import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OpportunityCard = ({ opportunity }) => {
    const isInternship = opportunity.type === 'internship';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 flex flex-col h-full hover:border-primary-500/50 transition-colors group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isInternship ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {isInternship ? <Briefcase className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800 text-slate-400 uppercase tracking-wider">
                    {opportunity.type}
                </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {opportunity.title}
            </h3>

            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {opportunity.description}
            </p>

            <div className="space-y-2 mb-6 flex-grow">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {(opportunity.requiredSkills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 uppercase">
                        {skill}
                    </span>
                ))}
                {(opportunity.requiredSkills?.length || 0) > 3 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-500 uppercase">
                        +{(opportunity.requiredSkills?.length || 0) - 3} more
                    </span>
                )}
            </div>

            <Link
                to={`/student/opportunities/${opportunity._id}`}
                className="mt-auto w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
            >
                View Details <ChevronRight className="w-4 h-4" />
            </Link>
        </motion.div>
    );
};

export default OpportunityCard;
