const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'company', 'faculty', 'admin'],
            default: 'student', // DEV ONLY: Allow 'admin' to be created via registration
        },
        // Common fields
        phone: String,
        bio: String,
        avatar: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'blocked'],
            default: 'pending'
        },

        // Student specific
        studentProfile: {
            college: String,
            branch: String,
            year: Number,
            skills: [String],
            resume: String,
            github: String,
            linkedin: String,
        },

        // Company specific
        companyProfile: {
            companyName: String,
            website: String,
            industry: String,
            location: String,
            description: String,
        },

        // Faculty specific
        facultyProfile: {
            department: String,
            designation: String,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
