import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, BookOpen, Briefcase, ShieldCheck } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 text-primary-400 text-sm font-medium mb-6 inline-block">
                            Intelligent Internship Matching
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8">
                            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Future Career</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10">
                            The all-in-one portal for students, companies, and faculty to collaborate on real-world projects and internships.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {[
                            { label: 'Student', path: '/login', icon: GraduationCap, color: 'text-blue-400' },
                            { label: 'Faculty', path: '/login', icon: BookOpen, color: 'text-purple-400' },
                            { label: 'Company', path: '/login', icon: Briefcase, color: 'text-emerald-400' },
                            { label: 'Admin', path: '/admin/login', icon: ShieldCheck, color: 'text-red-400' },
                        ].map((role) => (
                            <Link
                                key={role.label}
                                to={role.path}
                                className="flex flex-col items-center gap-4 p-6 glass-card border border-white/5 hover:border-white/20 transition-all group"
                            >
                                <div className={`p-4 rounded-2xl bg-white/5 ${role.color} group-hover:scale-110 transition-transform`}>
                                    <role.icon className="w-8 h-8" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-white">{role.label}</span>
                            </Link>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
                    >
                        {[
                            'Automated Verification',
                            'Skill-based Matching',
                            'Faculty Governance',
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 p-4 glass-card">
                                <CheckCircle2 className="w-6 h-6 text-primary-500" />
                                <span className="text-slate-200 font-medium">{feature}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
