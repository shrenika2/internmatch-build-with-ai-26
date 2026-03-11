import { useState, useEffect, useCallback } from 'react';

export const useNotifications = (socket, userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const playSound = useCallback(() => {
        // Simple beep or load from file
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));
        console.log('Ding! New message sound.');
    }, []);

    const showBrowserNotification = useCallback((title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }, []);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (!socket) return;

        const handleNotification = (data) => {
            // data: { type, content, senderName, ... }
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            playSound();
            showBrowserNotification(`New ${data.type}`, data.content);
        };

        socket.on('notification', handleNotification);
        return () => socket.off('notification', handleNotification);
    }, [socket, playSound, showBrowserNotification]);

    const clearNotifications = () => {
        setUnreadCount(0);
        setNotifications([]);
    };

    return { notifications, unreadCount, clearNotifications };
};
