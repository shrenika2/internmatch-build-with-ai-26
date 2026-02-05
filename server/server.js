const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const http = require('http');
const server = http.createServer(app);
const initSocket = require('./socket');

// Initialize Socket.io
const io = initSocket(server);

// Make io accessible in our routes/controllers
app.set('socketio', io);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
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

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Internship & Project Portal API' });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
