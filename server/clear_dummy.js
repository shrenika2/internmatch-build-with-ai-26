const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Announcement = require('./models/Announcement');

dotenv.config({ path: 'server/.env' });

const clearDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear all announcements (interpreted as dummy data by user)
        const result = await Announcement.deleteMany({});
        console.log(`Cleared ${result.deletedCount} announcements.`);

        process.exit();
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
};

clearDummyData();
