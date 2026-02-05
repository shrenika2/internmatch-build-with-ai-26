import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    // Global Action Listener for Admin Status Updates (Blocked/Force Logout)
    useEffect(() => {
        if (user && user.token) {
            const socket = io('http://localhost:5000', {
                auth: { token: user.token }
            });

            socket.on('force-logout', (data) => {
                alert(data.message || 'Your session has ended.');
                logout();
            });

            socket.on('admin:status-update', (data) => {
                if (data.userId === user._id) {
                    // Update local user status
                    const updatedUser = { ...user, status: data.status };
                    setUser(updatedUser);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));

                    if (data.status === 'blocked' || data.status === 'rejected') {
                        logout();
                    }
                }
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const login = async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (userData) => {
        const { data } = await authAPI.register(userData);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const refreshUserStatus = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) return;
            const parsed = JSON.parse(userInfo);

            // Call the new status endpoint (which bypasses the 'approved' middleware check)
            const { data } = await authAPI.getStatus();

            if (data.status !== parsed.status) {
                const updatedUser = { ...parsed, status: data.status };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                return data.status;
            }
            return parsed.status;
        } catch (err) {
            console.error('Status refresh failed:', err);
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUserStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
