import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notificationAPI } from '../utils/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load user from localStorage on mount
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                setUser(parsed);
                // Fetch initial notifications if user exists
                fetchNotifications();
            } catch (err) {
                console.error('Failed to parse user info', err);
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    // Fetch notifications
    const fetchNotifications = async (page = 1) => {
        try {
            const { data } = await notificationAPI.getNotifications(page);
            if (page === 1) {
                setNotifications(data.notifications || []);
            } else {
                setNotifications(prev => [...(prev || []), ...(data.notifications || [])]);
            }
            setUnreadCount(data.unreadCount);
            return data;
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => (prev || []).map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Socket Connection Management
    useEffect(() => {
        if (user && user.token) {
            const newSocket = io(SOCKET_URL, {
                auth: { token: user.token }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            // Listen for persistent notifications
            newSocket.on('notification:new', (notification) => {
                setNotifications(prev => [notification, ...(prev || [])]);
                setUnreadCount(prev => (prev || 0) + 1);

                // Show toast for high priority or general ones
                toast(notification.message, {
                    icon: notification.priority === 'high' ? '🚨' : '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        borderLeft: notification.priority === 'high' ? '4px solid #ef4444' : '4px solid #3b82f6'
                    }
                });
            });

            // Legacy notification listener (for compatibility during transition)
            newSocket.on('notification', (notification) => {
                setNotifications(prev => [notification, ...(prev || [])]);
                setUnreadCount(prev => (prev || 0) + 1);
                toast.success(notification.message);
            });

            newSocket.on('force-logout', (data) => {
                alert(data.message || 'Your session has ended.');
                logout();
            });

            newSocket.on('admin:status-update', (data) => {
                if (data.userId === user._id) {
                    const updatedUser = { ...user, status: data.status };
                    setUser(updatedUser);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));

                    if (data.status === 'blocked' || data.status === 'rejected') {
                        toast.error(`Access Revoked: Account ${data.status}`);
                        logout();
                    }
                }
            });

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [user?.token, user?._id]);

    const login = async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        fetchNotifications();
        toast.success(`Welcome back, ${data.name.split(' ')[0]}`, {
            icon: '⚡',
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return data;
    };

    const register = async (userData) => {
        const { data } = await authAPI.register(userData);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        fetchNotifications();
        return data;
    };

    const logout = () => {
        setUser(null);
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('userInfo');
        toast.success('Session Terminated Successfully');
        window.location.href = '/login';
    };

    const refreshUserStatus = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) return;
            const parsed = JSON.parse(userInfo);
            const { data } = await authAPI.getStatus();
            if (data.status !== parsed.status || data.isVerified !== parsed.isVerified || data.isSuspended !== parsed.isSuspended) {
                const updatedUser = { ...parsed, status: data.status, isVerified: data.isVerified, isSuspended: data.isSuspended };
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

    return (
        <AuthContext.Provider value={{
            user, loading, socket, notifications, unreadCount,
            login, register, logout, refreshUserStatus,
            fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
