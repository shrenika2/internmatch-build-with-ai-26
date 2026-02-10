import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary-600 rounded-lg group-hover:rotate-12 transition-transform">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                PortalX
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-2">
                            <Link to="/login" className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-colors">
                                Student
                            </Link>
                            <Link to="/login" className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-colors">
                                Faculty
                            </Link>
                            <Link to="/login" className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-colors">
                                Company
                            </Link>
                            <Link
                                to={user?.role === 'admin' ? '/admin/dashboard' : '/admin/login'}
                                title={user && user.role !== 'admin' ? "Admin access only" : ""}
                                className={`px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-colors ${user?.role === 'admin' ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-red-400'
                                    }`}
                            >
                                Admin
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    <LayoutDashboard className="w-4 h-4" />
                                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                </Link>
                                <div className="h-6 w-px bg-white/10" />
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10 text-white">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-600/20">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
