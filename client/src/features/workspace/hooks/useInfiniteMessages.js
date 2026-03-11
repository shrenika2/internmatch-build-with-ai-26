import { useState, useEffect, useCallback } from 'react';
import { workspaceApi } from '../api/workspaceApi';

export const useInfiniteMessages = (channelId, socket) => {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        if (!channelId) return;
        setMessages([]);
        setPage(1);
        setHasMore(true);
        loadMessages(1, true); // Reset
    }, [channelId]);

    const loadMessages = async (pageNum, reset = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await workspaceApi.getMessages(channelId, { page: pageNum });
            // res.data = { messages, total, hasMore }
            
            if (reset) {
                setMessages(res.data.messages);
            } else {
                setMessages(prev => [...res.data.messages, ...prev]); // Prepend older
            }
            
            setHasMore(res.data.hasMore);
            setPage(pageNum);
        } catch (err) {
            console.error("Load messages error:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (hasMore && !loading) {
            loadMessages(page + 1);
        }
    };

    // Realtime Append
    useEffect(() => {
        if (!socket) return;
        
        const onMessage = (msg) => {
            if (msg.channelId === channelId && !msg.isThread) {
                 setMessages(prev => {
                     if (prev.some(m => m._id === msg._id)) return prev;
                     return [...prev, msg]; // Append new
                 });
            }
        };
        
        const onUpdate = (msg) => {
             setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
        };
        
        const onDelete = (msgId) => {
             setMessages(prev => prev.filter(m => m._id !== msgId));
        };

        socket.on('receive_message', onMessage);
        socket.on('message_updated', onUpdate);
        socket.on('message_deleted', onDelete);
        
        return () => {
            socket.off('receive_message', onMessage);
            socket.off('message_updated', onUpdate);
            socket.off('message_deleted', onDelete);
        };
    }, [socket, channelId]);

    return { messages, loadMore, hasMore, loading };
};
