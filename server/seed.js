const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: 'server/.env' });

const bootstrapAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear any existing user with this email to ensure correct hashing and role
        await User.deleteMany({ email: 'admin@careergrid.com' });
        console.log('Cleared existing accounts with admin email...');

        // Create admin with plain password (Model handles hashing)
        await User.create({
            name: 'System Administrator',
            email: 'admin@careergrid.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@12345',
            role: 'admin',
            status: 'approved'
        });

        console.log('Admin account created successfully.');
        console.log('Email: admin@careergrid.com');
        console.log('Password: Admin@12345');

        process.exit();
    } catch (err) {
        console.error('Error bootstrapping admin:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

bootstrapAdmin();
