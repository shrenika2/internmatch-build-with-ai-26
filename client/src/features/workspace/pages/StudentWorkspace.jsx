import React, { useEffect, useState, useCallback, useRef } from 'react';
import ChannelList from '../components/ChannelList';
import ChatWindow from '../components/ChatWindow';
import CommunityList from '../components/CommunityList';
import CreatorDashboard from '../components/CreatorDashboard';
import { workspaceApi } from '../api/workspaceApi';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../../../context/AuthContext';

const StudentWorkspace = () => {
    // STATE
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [loading, setLoading] = useState(false);

    // Community State
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);

    const { user: currentUser, socket } = useAuth();

    // --- LOAD COMMUNITIES ---
    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        try {
            const res = await workspaceApi.getCommunities();
            setCommunities(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    // --- FETCH CHANNELS (When Community Selected) ---
    useEffect(() => {
        if (!selectedCommunity) {
            setChannels([]);
            setCurrentChannel(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await workspaceApi.getChannels(selectedCommunity._id);
                setChannels(res.data);
                if (res.data.length > 0) {
                    setCurrentChannel(res.data[0]);
                } else {
                    setCurrentChannel(null);
                }
            } catch (err) {
                console.error("Failed to load channels:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCommunity]);

    // --- SOCKET SETUP ---
    useEffect(() => {
        if (!socket) return;
        if (!socket.connected) socket.connect();

        const onChannelNew = (newChannel) => {
            if (selectedCommunity && newChannel.communityId === selectedCommunity._id) {
                setChannels(prev => {
                    if (prev.some(c => c._id === newChannel._id)) return prev;
                    return [...prev, newChannel];
                });
            }
        };

        const onChannelDeleted = (channelId) => {
            setChannels(prev => prev.filter(c => c._id !== channelId));
            setCurrentChannel(prev => (prev && prev._id === channelId) ? null : prev);
        };

        socket.on('channel_created', onChannelNew);
        socket.on('channel_deleted', onChannelDeleted);

        return () => {
            socket.off('channel_created', onChannelNew);
            socket.off('channel_deleted', onChannelDeleted);
        };
    }, [selectedCommunity, socket]);

    // --- CHANNEL SELECTION & ROOM JOINING ---
    const handleSelectChannel = useCallback((channel) => {
        if (!channel) return;
        if (currentChannel?._id === channel._id) return;

        // Joining is handled inside ChatWindow usually, but we keep this for consistency if needed
        setCurrentChannel(channel);
    }, [currentChannel]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#1e1f22] text-[#dbdee1] font-sans selection:bg-[#5865f2]/30">
            {/* Sidebar 1: Communities */}
            <CommunityList
                communities={communities}
                selectedCommunity={selectedCommunity}
                onSelect={setSelectedCommunity}
                onDashboardClick={() => setShowDashboard(true)}
            />

            {showDashboard ? (
                <CreatorDashboard
                    currentUser={currentUser}
                    onClose={() => setShowDashboard(false)}
                    onCommunityCreated={loadCommunities}
                />
            ) : (
                <>
                    {/* Sidebar 2: Channels */}
                    <ChannelList
                        community={selectedCommunity}
                        channels={channels}
                        currentChannel={currentChannel}
                        onSelectChannel={handleSelectChannel}
                        loading={loading}
                    />

                    {/* Main Chat Area */}
                    <ChatWindow
                        channel={currentChannel}
                        currentUser={currentUser}
                        socket={socket}
                    />
                </>
            )}

            <ThemeToggle />
        </div>
    );
};

export default StudentWorkspace;
