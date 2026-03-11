import React from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

const VoiceChannel = ({ channel, socket, user }) => {
    const { joinVoice, leaveVoice, toggleMute, isMuted, joined, peers } = useWebRTC(socket, channel._id, user);

    if (!joined) {
        return (
            <div className="flex-1 bg-[#313338] flex flex-col items-center justify-center gap-4">
                <div className="text-2xl font-bold text-white">Voice Channel: {channel.name}</div>
                <button 
                    onClick={joinVoice}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
                >
                    Connect to Voice
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#1e1f22] p-4 flex flex-col">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
               {/* Me */}
               <div className={`aspect-video bg-[#2b2d31] rounded-lg flex flex-col items-center justify-center border-2 ${!isMuted ? 'border-green-500' : 'border-transparent'} relative`}>
                    <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2">
                        {user.name[0]}
                    </div>
                    <span className="text-white font-bold">{user.name} (You)</span>
                    {isMuted && <span className="absolute top-2 right-2 text-red-500">🔇</span>}
               </div>

               {/* Peers */}
               {peers.map(peerId => (
                   <div key={peerId} className="aspect-video bg-[#2b2d31] rounded-lg flex flex-col items-center justify-center relative">
                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2">
                            ?
                        </div>
                        <span className="text-white font-bold">User {peerId.slice(0, 4)}</span>
                        {/* Audio element handled in hook or here if manual */}
                   </div>
               ))}
            </div>

            <div className="h-20 bg-[#2b2d31] rounded-xl flex items-center justify-center gap-6 mt-4">
                <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'} text-white transition-colors`}
                >
                    {isMuted ? '🔇 Unmute' : '🎙 Mute'}
                </button>
                <button 
                    onClick={leaveVoice}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    Disconnect
                </button>
            </div>
        </div>
    );
};

export default VoiceChannel;
