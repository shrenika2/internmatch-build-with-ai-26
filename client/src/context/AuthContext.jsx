import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

const SOCKET_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            }
        } catch (err) {
            console.error('Failed to parse user info from localStorage', err);
            localStorage.removeItem('userInfo');
        } finally {
            setLoading(false);
        }
    }, []);

    // Socket Connection Management
    useEffect(() => {
        if (user && user.token) {
            const newSocket = io(SOCKET_URL, {
                auth: { token: user.token }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // Join role-based room
                if (user.role === 'student') {
                    newSocket.emit('join_room', 'students');
                } else if (user.role === 'faculty') {
                    newSocket.emit('join_room', 'faculty');
                } else if (user.role === 'company') {
                    newSocket.emit('join_room', 'company');
                }
            });

            newSocket.on('force-logout', (data) => {
                alert(data.message || 'Your session has ended.');
                logout();
            });

            newSocket.on('admin:status-update', (data) => {
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

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [user?.token, user?._id]); // Only re-run if token or ID changes

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

            // Call the new status endpoint
            const { data } = await authAPI.getStatus();

            if (
                data.status !== parsed.status ||
                data.isVerified !== parsed.isVerified ||
                data.isSuspended !== parsed.isSuspended
            ) {
                const updatedUser = {
                    ...parsed,
                    status: data.status,
                    isVerified: data.isVerified,
                    isSuspended: data.isSuspended
                };
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
        <AuthContext.Provider value={{ user, loading, socket, login, register, logout, refreshUserStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
