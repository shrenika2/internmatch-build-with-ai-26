const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const env = require('./config/env');
const logger = require('./utils/logger');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Make io accessible in our routes/controllers
app.set('socketio', io);

// Metrics tracking
const { metricsMiddleware } = require('./middleware/metricsMiddleware');
app.use(metricsMiddleware);

// CORS Configuration
const allowedOrigins = [
    env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Preflight OPTIONS support
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security Hardening
const { securityHardening } = require('./middleware/securityMiddleware');

// Set security headers with Helmet
app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
}));

// Apply Rate Limiting & Abuse Detection
securityHardening(app);

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Request ID & Logging Middleware
app.use((req, res, next) => {
    req.id = uuidv4();
    logger.http(`[${req.id}] INCOMING: ${req.method} ${req.originalUrl}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`[${req.id}] OUTGOING: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Logging in development
if (env.NODE_ENV === 'development') {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.http(message.trim()) }
    }));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/communities', require('./routes/communityRoutes'));
app.use('/api/practice', require('./routes/practiceRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/student-profile', require('./routes/studentProfileRoutes'));
app.use('/api/experience', require('./routes/experienceRoutes'));
app.use('/api/evaluations', require('./routes/evaluationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Internship & Project Portal API' });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = { app, server, io };
