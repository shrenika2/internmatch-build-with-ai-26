import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            if (loggedInUser.role !== 'admin') {
                throw new Error('Not an admin account');
            }
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-card p-10 border border-primary-500/20 shadow-2xl shadow-primary-500/10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary-600/20 border border-primary-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-primary-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Admin Console</h2>
                    <p className="text-slate-500 mt-2 font-medium">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email Identifier</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-700"
                                placeholder="admin@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Access Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-600/30 transform active:scale-[0.98] group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Authenticate System
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                        © 2026 Academic-Professional Portal Security
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
