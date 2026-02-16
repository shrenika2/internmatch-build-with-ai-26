const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const initSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // JWT Authentication Middleware for Sockets
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            if (user.status === 'blocked' || user.status === 'rejected') {
                return next(new Error("Authentication error: Account blocked or rejected"));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Join personal room for private notifications
        socket.join(socket.user._id.toString());

        // Community rooms
        socket.on('join_room', (communityId) => {
            socket.join(communityId);
        });

        socket.on('leave_room', (communityId) => {
            socket.leave(communityId);
        });

        // Opportunity rooms for real-time practice updates
        socket.on('join_opportunity', (oppId) => {
            socket.join(`opportunity_${oppId}`);
        });

        socket.on('leave_opportunity', (oppId) => {
            socket.leave(`opportunity_${oppId}`);
        });

        // Faculty & Project specific real-time rooms
        if (socket.user.role === 'faculty') {
            socket.join(`faculty:${socket.user._id}`);
        }

        if (socket.user.role === 'company') {
            socket.join(`company:${socket.user._id}`);
        }

        socket.on('join_project', (projectId) => {
            socket.join(`project:${projectId}`);
        });

        socket.on('leave_project', (projectId) => {
            socket.leave(`project:${projectId}`);
        });

        socket.on('send_project_message', (data) => {
            io.to(`project:${data.projectId}`).emit('new_project_message', {
                ...data,
                sender: { _id: socket.user._id, name: socket.user.name, role: socket.user.role },
                createdAt: new Date()
            });
        });

        socket.on('join_opportunity_chat', (oppId) => {
            socket.join(`opportunity_chat:${oppId}`);
        });

        socket.on('send_opportunity_message', (data) => {
            io.to(`opportunity_chat:${data.oppId}`).emit('new_opportunity_message', {
                ...data,
                sender: { _id: socket.user._id, name: socket.user.name, role: socket.user.role },
                createdAt: new Date()
            });
        });

        socket.on('leave_opportunity_chat', (oppId) => {
            socket.leave(`opportunity_chat:${oppId}`);
        });

        // Team Collaboration Events
        socket.on('team:typing', (data) => {
            // data contains: teamId, isTyping
            socket.to(`project:${data.teamId}`).emit('team:typing_update', {
                userId: socket.user._id,
                userName: socket.user.name,
                isTyping: data.isTyping
            });
        });

        socket.on('team:read_receipt', (data) => {
            // data contains: teamId, messageId
            socket.to(`project:${data.teamId}`).emit('team:read_update', {
                messageId: data.messageId,
                userId: socket.user._id,
                at: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initSocket;
