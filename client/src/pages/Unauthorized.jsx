import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="text-center">
                <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Access Denied</h1>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    You do not have the necessary permissions to access this page.
                    Please contact a system administrator if you believe this is an error.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
