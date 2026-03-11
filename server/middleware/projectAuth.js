const Opportunity = require('../models/Opportunity');
const Team = require('../models/Team');

/**
 * Verify Project Access Helper
 * 
 * WHY: Object-level authorization is critical to prevent "Insecure Direct Object Reference" (IDOR) attacks.
 * Even if a user is authenticated, they should not be able to guess a Project ID and inject messages
 * unless they are the designated Mentor or an approved Team Member. 
 * This prevents cross-tenant data injection and identity spoofing.
 */
const verifyProjectAccess = async (projectId, userId, role) => {
    // 1. Verify Project existence
    const project = await Opportunity.findById(projectId);
    if (!project) {
        return { authorized: false, status: 404, message: "Project node not found" };
    }

    // 2. Role-based ownership check
    if (role === 'faculty') {
        // Faculty must be the one who launched the project (postedBy)
        if (project.postedBy.toString() !== userId.toString()) {
            return { authorized: false, status: 403, message: "Unauthorized Project Access: You are not recorded as the mentor for this node." };
        }
        return { authorized: true };
    }

    if (role === 'student') {
        /**
         * Student must belong to a team that has been officially accepted by a mentor
         * for this specific project.
         */
        const team = await Team.findOne({
            opportunity: projectId,
            status: 'accepted',
            $or: [
                { leader: userId },
                { members: { $elemMatch: { user: userId, status: 'accepted' } } }
            ]
        });

        if (!team) {
            return { authorized: false, status: 403, message: "Unauthorized Project Access: Your squad does not have an active uplink to this project." };
        }
        return { authorized: true };
    }

    // Default deny for other roles (admins/companies) trying to access faculty messaging
    return { authorized: false, status: 403, message: "Unauthorized Project Access" };
};

module.exports = { verifyProjectAccess };
