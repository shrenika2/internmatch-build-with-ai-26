const mongoose = require('mongoose');

const adminSettingSchema = mongoose.Schema(
    {
        // AUTH & ACCESS CONTROL
        enableStudentAutoApproval: { type: Boolean, default: true },
        enableCompanyAutoApproval: { type: Boolean, default: false },
        allowedCompanyEmailDomains: { type: [String], default: [] },

        // OPPORTUNITY & APPLICATION RULES
        maxApplicationsPerStudent: { type: Number, default: 10 },
        applicationCooldownDays: { type: Number, default: 7 },
        enableAIShortlisting: { type: Boolean, default: true },
        allowMultipleActiveOffers: { type: Boolean, default: false },

        // PLATFORM FEATURES TOGGLES
        enablePracticeModule: { type: Boolean, default: true },
        enableCommunityChat: { type: Boolean, default: true },
        enableExperienceSharing: { type: Boolean, default: true },

        // SYSTEM LIMITS
        maxResumeSizeMB: { type: Number, default: 5 },
        allowedResumeFormats: { type: [String], default: ['pdf', 'docx'] },
        enableCloudStorage: { type: Boolean, default: false },

        // METADATA
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
