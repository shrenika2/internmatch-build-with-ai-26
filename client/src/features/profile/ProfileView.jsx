import React from 'react';
import {
    Github, Linkedin, Globe, Code2,
    Edit3, ExternalLink, Mail, MapPin,
    Calendar, Building2, Award, Download,
    Briefcase, Sparkles, Binary, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileView = ({ profile, onEdit }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Professional Headline Header */}
            <section className="glass-card p-12 border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-12 relative">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900 border-4 border-white/5 flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden group">
                        {profile?.user?.avatar ? (
                            <img src={profile.user.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="group-hover:scale-110 transition-transform">{profile?.fullName?.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{profile?.fullName}</h2>
                            {profile?.user?.isVerified && (
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-lg flex items-center gap-2">
                                    <Award className="w-3 h-3" /> Verified Identity
                                </span>
                            )}
                            {profile?.isComplete && (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Protocol Complete
                                </span>
                            )}
                        </div>

                        <p className="text-xl text-primary-400 font-bold uppercase tracking-widest mb-6">{profile?.branch} | Year {profile?.year}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {profile?.location || profile?.user?.location || 'Location Not Set'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {profile?.college || 'College Not Set'} | {profile?.collegeId || 'ID-PENDING'}
                            </div>
                            <div className="flex items-center gap-2 font-black text-slate-300">
                                <Mail className="w-4 h-4" /> {profile?.user?.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                        >
                            <Edit3 className="w-4 h-4" /> Modify Profile
                        </button>
                        <a
                            href={profile?.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20"
                        >
                            <Download className="w-4 h-4" /> Access Resume
                        </a>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column - Meta Data */}
                <div className="space-y-10">
                    {/* Competitive Programming */}
                    <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                            <Binary className="w-4 h-4 text-purple-500" /> Coding Intelligence
                        </h3>
                        <div className="space-y-6">
                            {['leetcode', 'codeforces', 'codechef'].map(platform => (
                                <div key={platform} className="flex justify-between items-center group">
                                    <span className="text-sm font-black text-white uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">{platform}</span>
                                    <a href={profile?.cpProfiles?.[platform]} target="_blank" className="text-[10px] font-black text-primary-500 uppercase hover:text-white transition-colors">View Profile</a>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Links */}
                    <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                            <Globe className="w-4 h-4 text-emerald-500" /> Digital Hubs
                        </h3>
                        <div className="space-y-4">
                            <SocialLink icon={Linkedin} label="LinkedIn" url={profile?.links?.linkedin} color="text-blue-500" />
                            <SocialLink icon={Github} label="GitHub" url={profile?.links?.github} color="text-slate-200" />
                            <SocialLink icon={Globe} label="Portfolio" url={profile?.links?.portfolio} color="text-emerald-500" />
                        </div>
                    </section>

                    {/* Proficiencies */}
                    <section className="glass-card p-10 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                            <Award className="w-4 h-4 text-amber-500" /> Skill Inventory
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(profile?.skills || []).map(skill => (
                                <span key={skill} className="px-3 py-1.5 bg-primary-600/10 text-primary-400 border border-primary-500/10 rounded-lg text-[10px] font-black uppercase">{skill}</span>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column - Experience & Bio */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Bio */}
                    <section className="glass-card p-12 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-primary-500" /> Professional Narrative
                        </h3>
                        <p className="text-lg text-slate-300 font-medium leading-[1.8] italic">
                            {profile?.bio || "No professional narrative uplinked yet..."}
                        </p>
                    </section>

                    {/* Experience Timeline */}
                    <section className="glass-card p-12 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-primary-500" /> Professional Trajectory
                        </h3>

                        <div className="space-y-12">
                            {(profile?.experiences || []).length > 0 ? (profile?.experiences || []).map((exp, idx) => (
                                <div key={idx} className="relative pl-12 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-white/5 after:absolute after:left-0 after:top-2 after:w-4 after:h-4 after:bg-primary-600 after:rounded-full after:shadow-lg after:shadow-primary-600/40">
                                    <div className="flex flex-col md:flex-row justify-between mb-2">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">{exp.title}</h4>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-primary-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> {exp.company}
                                    </p>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">{exp.description}</p>
                                </div>
                            )) : (
                                <div className="py-20 text-center border-dashed border-2 border-white/5 rounded-[2.5rem]">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-800" />
                                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No field experience recorded in protocol.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Tech Stack Matrix */}
                    <section className="glass-card p-12 border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Binary className="w-5 h-5 text-primary-500" /> Core Stack Architecture
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(profile?.techStack || []).map(tech => (
                                <div key={tech} className="px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-wider hover:bg-white/5 transition-colors cursor-default">
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const SocialLink = ({ icon: Icon, label, url, color }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group ${!url ? 'opacity-30 pointer-events-none grayscale' : ''}`}
    >
        <div className="flex items-center gap-4">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">{label}</span>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
    </a>
);

export default ProfileView;
