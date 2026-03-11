import { useState, useEffect, useRef } from 'react';

const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const useWebRTC = (socket, channelId, user) => {
    const [peers, setPeers] = useState([]); // Array of socketIds in room
    const peerConnections = useRef({}); // socketId -> RTCPeerConnection
    const localStream = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [joined, setJoined] = useState(false);

    // Initialize Local Stream
    const joinVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStream.current = stream;
            setJoined(true);
            socket.emit('voice:join', channelId);
        } catch (err) {
            console.error("Mic access denied:", err);
        }
    };

    const leaveVoice = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        setPeers([]);
        setJoined(false);
        // socket emit leave handled by disconnect usually, or add explicit
    };

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks()[0].enabled = isMuted; // Toggle: if isMuted is true, enabled becomes true (unmute)
            setIsMuted(!isMuted);
        }
    };

    // Socket Events
    useEffect(() => {
        if (!socket || !joined) return;

        socket.on('voice:users', async (users) => {
            // Users already in room. Call them.
            setPeers(users);
            users.forEach(targetId => createPeer(targetId, true));
        });

        socket.on('voice:offer', async ({ sdp, sender }) => {
            const pc = createPeer(sender, false);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('voice:answer', { target: sender, sdp: answer });
        });

        socket.on('voice:answer', async ({ sdp, sender }) => {
            const pc = peerConnections.current[sender];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        socket.on('voice:ice', async ({ candidate, sender }) => {
            const pc = peerConnections.current[sender];
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            socket.off('voice:users');
            socket.off('voice:offer');
            socket.off('voice:answer');
            socket.off('voice:ice');
        };
    }, [socket, joined, channelId]);

    const createPeer = (targetId, isInitiator) => {
        if (peerConnections.current[targetId]) return peerConnections.current[targetId];

        const pc = new RTCPeerConnection(ICE_SERVERS);
        
        // Add local tracks
        localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice:ice', { target: targetId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            // Handle remote stream - usually add to a Ref/Audio element in UI
            // For now, simpler to expose the stream or create audio element here?
            // React way: Update state to include stream for rendering <audio>
            const remoteStream = event.streams[0];
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(e => console.error("Audio play error", e));
        };

        if (isInitiator) {
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('voice:offer', { target: targetId, sdp: offer });
            };
        }

        peerConnections.current[targetId] = pc;
        return pc;
    };

    return { joinVoice, leaveVoice, toggleMute, isMuted, joined, peers };
};
