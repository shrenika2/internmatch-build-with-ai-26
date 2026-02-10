const AdminSetting = require('../models/AdminSetting');

class SettingsService {
    constructor() {
        this.cache = null;
        this.lastFetched = null;
        this.CACHE_TTL = 300000; // 5 minutes cache
    }

    async getSettings() {
        // Return cache if valid
        if (this.cache && this.lastFetched && (Date.now() - this.lastFetched < this.CACHE_TTL)) {
            return this.cache;
        }

        let settings = await AdminSetting.findOne();

        // Auto-bootstrap defaults if missing
        if (!settings) {
            settings = await AdminSetting.create({});
            console.log('--- SYSTEM: Auto-bootstrapped default admin settings ---');
        }

        this.cache = settings;
        this.lastFetched = Date.now();
        return settings;
    }

    async updateSettings(newSettings, adminId) {
        let settings = await AdminSetting.findOne();
        if (!settings) {
            settings = new AdminSetting();
        }

        // Apply new values
        Object.keys(newSettings).forEach(key => {
            if (settings[key] !== undefined && key !== '_id' && key !== 'createdAt') {
                settings[key] = newSettings[key];
            }
        });

        settings.lastUpdatedBy = adminId;
        await settings.save();

        // Update cache
        this.cache = settings;
        this.lastFetched = Date.now();

        return settings;
    }

    // Force refresh cache (called after update)
    async refreshCache() {
        this.cache = null;
        this.lastFetched = null;
        return this.getSettings();
    }
}

// Singleton instance
module.exports = new SettingsService();
