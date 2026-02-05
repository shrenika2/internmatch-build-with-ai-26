const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: 'server/.env' });

const bootstrapAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear any existing admin to ensure correct hashing
        await User.deleteMany({ role: 'admin' });
        console.log('Cleared existing admin accounts...');

        // Create admin with plain password (Model handles hashing)
        await User.create({
            name: 'System Administrator',
            email: 'admin@college.edu',
            password: 'admin123',
            role: 'admin',
            status: 'approved'
        });

        console.log('Admin account created successfully.');
        console.log('Email: admin@college.edu');
        console.log('Password: admin123');

        process.exit();
    } catch (err) {
        console.error('Error bootstrapping admin:', err);
        process.exit(1);
    }
};

bootstrapAdmin();
