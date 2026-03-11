import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../api/workspaceApi';

const CreatorDashboard = ({ community, currentUser }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (community && community.creatorId === currentUser._id) {
            loadRequests();
        }
    }, [community]);

    const loadRequests = async () => {
        try {
            const res = await workspaceApi.getJoinRequests(community._id, currentUser._id);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            await workspaceApi.processRequest(community._id, requestId, action, currentUser._id);
            setRequests(prev => prev.filter(r => r._id !== requestId));
            alert(`Request ${action}ed`);
        } catch (err) {
            alert('Failed to process request');
        }
    };

    if (!community || community.creatorId !== currentUser._id) return null;

    return (
        <div className="bg-[#1e1f22] p-4 border-t border-gray-700 text-white">
            <h3 className="font-bold mb-2">Pending Join Requests</h3>
            {loading ? <p>Loading...</p> : (
                <div className="flex flex-col gap-2">
                    {requests.length === 0 && <p className="text-gray-400 text-sm">No pending requests.</p>}
                    {requests.map(req => (
                        <div key={req._id} className="flex items-center justify-between bg-[#2b2d31] p-2 rounded">
                            <span className="text-sm">User: {req.requesterId}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(req._id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700 p-1 rounded text-xs px-2"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, 'reject')}
                                    className="bg-red-600 hover:bg-red-700 p-1 rounded text-xs px-2"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatorDashboard;
