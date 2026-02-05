const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        description: String,
        type: {
            type: String,
            enum: ['apti', 'coding', 'pdf', 'doc', 'link'],
            required: true,
        },
        url: {
            type: String,
            required: [true, 'Please add a file URL or reference'],
        },
        category: {
            type: String,
            enum: ['placement', 'academic', 'preparation', 'guidance'],
            default: 'placement',
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        relatedOpportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Resource', resourceSchema);
