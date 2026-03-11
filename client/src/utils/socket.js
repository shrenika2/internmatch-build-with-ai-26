import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Socket Service Singleton
 * Ensures only one connection exists across the entire MERN application.
 */
export const getSocket = (token) => {
    if (socketInstance && socketInstance.connected) {
        return socketInstance;
    }

    if (!token) {
        console.warn('[SOCKET_SERVICE] No token provided, skipping connection.');
        return null;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });

    // Lifecycle Logging
    socketInstance.on('connect', () => {
        console.log(`%c[SOCKET_SERVICE] Connected: ${socketInstance.id}`, 'color: #10b981; font-weight: bold');
    });

    socketInstance.on('disconnect', (reason) => {
        console.warn(`[SOCKET_SERVICE] Disconnected: ${reason}`);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('[SOCKET_SERVICE] Connection Error:', error.message);
    });

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        console.log('[SOCKET_SERVICE] Terminating connection...');
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export const socketUtility = {
    get current() {
        return socketInstance;
    },
    connect: getSocket,
    disconnect: disconnectSocket
};

export default socketUtility;
