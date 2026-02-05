const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        content: {
            type: String,
            required: [true, 'Please add content'],
        },
        category: {
            type: String,
            enum: ['hiring', 'hackathon', 'project', 'general'],
            default: 'general',
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['company', 'faculty', 'admin'],
            required: true,
        },
        link: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Announcement', announcementSchema);
