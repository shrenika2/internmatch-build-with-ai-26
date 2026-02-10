import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../NotificationCenter';

const StudentNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/student/dashboard" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary-600 rounded-lg group-hover:rotate-12 transition-transform">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Student Portal
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-6 flex items-baseline space-x-1">
                            <Link to="/student/opportunities" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Opportunities
                            </Link>
                            <Link to="/student/community" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Community Hub
                            </Link>
                            <Link to="/student/practice" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Practice Resources
                            </Link>
                            <Link to="/student/guidance" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Guidance Hub
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <Link to="/student/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default StudentNavbar;
