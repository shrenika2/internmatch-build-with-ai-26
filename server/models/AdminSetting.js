const mongoose = require('mongoose');

const adminSettingSchema = mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        description: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
