const connectDB = require('./config/db');
const { server } = require('./app');
const env = require('./config/env');
const seedAdmin = require('./seed/adminSeed');

// Connect to database and seed
connectDB().then(() => {
    seedAdmin();
});

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`[SERVER] Running in ${env.NODE_ENV} mode on port ${PORT}`);
});
