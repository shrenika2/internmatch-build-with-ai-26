import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, GraduationCap, AlertCircle, Building, BookOpen, UserCircle2, ShieldCheck } from 'lucide-react';
import BranchSelect from '../components/BranchSelect';


const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentProfile: {
            branch: '',
            year: '',
            cgpa: ''
        },
        companyProfile: {
            companyName: '',
            hrEmail: ''
        },
        facultyProfile: {
            department: '',
            designation: ''
        }
    });

    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalize payload: Only send relevant profile
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            if (formData.role === 'student') {
                payload.studentProfile = formData.studentProfile;
            } else if (formData.role === 'company') {
                payload.companyProfile = formData.companyProfile;
            } else if (formData.role === 'faculty') {
                payload.facultyProfile = formData.facultyProfile;
            }

            await register(payload);
            // Redirect based on role after successful registration
            if (formData.role === 'admin') navigate('/admin');
            else navigate(`/${formData.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'company', label: 'Company', icon: Briefcase },
        { id: 'faculty', label: 'Faculty', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center px-4 bg-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full glass-card p-10 border border-white/10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/20">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-slate-400 mt-2">Join the academic-professional bridge</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-4 text-center">Select Your Role</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role.id })}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.role === role.id
                                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                                        : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                >
                                    <role.icon className="w-6 h-6" />
                                    <span className="text-xs font-semibold uppercase">{role.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                                    placeholder={formData.role === 'student' ? 'name@college.edu' : 'email@work.com'}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={formData.role}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6"
                        >
                            <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider">{formData.role} Profile Details</h3>

                            {formData.role === 'student' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Branch</label>
                                        <BranchSelect
                                            value={formData.studentProfile.branch}
                                            onChange={(value) => setFormData({
                                                ...formData,
                                                studentProfile: { ...formData.studentProfile, branch: value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Year</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                                            placeholder="3"
                                            value={formData.studentProfile.year}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                studentProfile: { ...formData.studentProfile, year: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">CGPA</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                                            placeholder="9.0"
                                            value={formData.studentProfile.cgpa}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                studentProfile: { ...formData.studentProfile, cgpa: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.role === 'company' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none"
                                                placeholder="Google India"
                                                value={formData.companyProfile.companyName}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    companyProfile: { ...formData.companyProfile, companyName: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">HR Contact Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none"
                                                placeholder="hr@company.com"
                                                value={formData.companyProfile.hrEmail}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    companyProfile: { ...formData.companyProfile, hrEmail: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.role === 'faculty' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Department / Branch</label>
                                        <BranchSelect
                                            value={formData.facultyProfile.department}
                                            onChange={(value) => setFormData({
                                                ...formData,
                                                facultyProfile: { ...formData.facultyProfile, department: value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Designation</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                                            placeholder="Associate Professor"
                                            value={formData.facultyProfile.designation}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                facultyProfile: { ...formData.facultyProfile, designation: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/25 transform active:scale-[0.98]"
                    >
                        Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
