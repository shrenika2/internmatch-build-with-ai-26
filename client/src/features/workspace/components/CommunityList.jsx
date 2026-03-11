import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../api/workspaceApi';

const CommunityList = ({ onSelectCommunity, currentUser }) => {
    const [communities, setCommunities] = useState([]);
    // map communityId -> request status
    const [requests, setRequests] = useState({});

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            const res = await workspaceApi.getCommunities();
            setCommunities(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = async (communityId) => {
        try {
            await workspaceApi.requestJoin(communityId, currentUser._id);
            setRequests({ ...requests, [communityId]: 'pending' });
            alert('Request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const isMember = (community) => community.members.includes(currentUser._id);
    const isCreator = (community) => community.creatorId === currentUser._id;

    return (
        <div className="flex flex-col gap-4 p-4 text-white overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4">Discover Communities</h2>
            {communities.map(community => (
                <div key={community._id} className="bg-[#2b2d31] p-4 rounded-lg flex justify-between items-center shadow-md hover:bg-[#313338] transition-colors">
                    <div>
                        <h3 className="font-bold text-lg">{community.name}</h3>
                        <span className="text-xs text-gray-400">
                            {community.members.length} members • Created by {community.creatorId === currentUser._id ? 'You' : 'User'}
                        </span>
                    </div>

                    <div>
                        {isMember(community) ? (
                            <button
                                onClick={() => onSelectCommunity(community)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                            >
                                Enter
                            </button>
                        ) : (
                            <button
                                onClick={() => handleJoin(community._id)}
                                disabled={requests[community._id] === 'pending'}
                                className={`${requests[community._id] === 'pending' ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'} text-white px-4 py-2 rounded font-medium transition-colors`}
                            >
                                {requests[community._id] === 'pending' ? 'Pending' : 'Request to Join'}
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {communities.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    No communities found. Create one!
                </div>
            )}
        </div>
    );
};

export default CommunityList;
