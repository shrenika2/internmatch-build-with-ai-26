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
            email: 'admin@careergrid.com',
            password: 'admin@12345',
            role: 'admin',
            status: 'approved'
        });

        console.log('Admin account created successfully.');
        console.log('Email: admin@careergrid.com');
        console.log('Password: admin@12345');

        process.exit();
    } catch (err) {
        console.error('Error bootstrapping admin:', err);
        process.exit(1);
    }
};

bootstrapAdmin();
