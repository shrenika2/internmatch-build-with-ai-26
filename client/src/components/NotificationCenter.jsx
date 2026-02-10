import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, ExternalLink, Mail, Briefcase, FileText, Megaphone, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleNotifClick = (notif) => {
        if (!notif.isRead) markAsRead(notif._id);
        if (notif.link && notif.link !== '#') {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application': return <Briefcase className="w-4 h-4 text-blue-400" />;
            case 'resource_added': return <FileText className="w-4 h-4 text-purple-400" />;
            case 'broadcast': return <Megaphone className="w-4 h-4 text-amber-400" />;
            case 'profile_update': return <UserCheck className="w-4 h-4 text-emerald-400" />;
            case 'opportunity_update': return <Briefcase className="w-4 h-4 text-pink-400" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 max-h-[480px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="font-bold text-white text-sm">Notifications</h3>
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] uppercase font-bold text-primary-400 hover:text-primary-300"
                                >
                                    Mark all read
                                </button>
                            </div>

                            <div className="overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => handleNotifClick(n)}
                                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all relative ${!n.isRead ? 'bg-primary-500/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 p-2 rounded-lg bg-slate-800 shrink-0`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`text-xs font-bold leading-tight mb-1 ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[9px] text-slate-600 mt-2 font-medium uppercase">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-slate-600">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">No notifications yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
                                <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">View All Activity</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
