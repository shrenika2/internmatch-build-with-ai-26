const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const TeamEvaluation = require('../models/TeamEvaluation');
const TeamActivity = require('../models/TeamActivity');
const Notification = require('../models/Notification');
const Opportunity = require('../models/Opportunity');

/**
 * SECURITY HELPER: Verify Faculty Ownership
 * Ensures the requesting faculty is the one who posted the project (the mentor).
 * Prevents unauthorized grading or viewing of student squads.
 */
const verifyFacultyOwnership = async (projectId, facultyId) => {
    const project = await Opportunity.findById(projectId);
    if (!project) return { authorized: false, status: 404, message: "Project not found" };

    // Check if the postedBy ID matches the requesting faculty ID
    if (project.postedBy.toString() !== facultyId.toString()) {
        return { authorized: false, status: 403, message: "Unauthorized access: You are not the mentor of this project" };
    }
    return { authorized: true };
};

// @desc    Get all teams for a project (for evaluation)
// @route   GET /api/evaluations/project/:projectId
const getTeamsForEvaluation = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Security Gate: Verify faculty mentors this project
    const auth = await verifyFacultyOwnership(projectId, req.user._id);
    if (!auth.authorized) {
        return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const teams = await Team.find({ opportunity: projectId })
        .populate('members.user', 'name studentProfile')
        .populate('leader', 'name');

    const evaluations = await TeamEvaluation.find({ project: projectId });

    // Merge evaluations with teams
    const teamsWithEvals = teams.map(team => {
        const teamEval = evaluations.find(e => e.team.toString() === team._id.toString());
        return {
            ...team.toObject(),
            evaluation: teamEval || null
        };
    });

    res.json(teamsWithEvals);
});

// @desc    Submit evaluation
// @route   POST /api/evaluations
const submitEvaluation = asyncHandler(async (req, res) => {
    console.log("[DEBUG] Incoming Evaluation payload:", req.body);
    const { teamId, projectId, grade, feedback, criteria } = req.body;

    // Validation
    if (!teamId || !projectId || !grade) {
        res.status(400);
        throw new Error("Missing tactical data: teamId, projectId, and grade are required.");
    }

    try {
        // Security Gate: Verify faculty mentors this project
        const auth = await verifyFacultyOwnership(projectId, req.user._id);
        if (!auth.authorized) {
            console.warn(`[SECURITY] Unauthorized evaluation attempt by user ${req.user._id} on project ${projectId}`);
            return res.status(auth.status).json({ success: false, message: auth.message });
        }

        let evaluation = await TeamEvaluation.findOne({ team: teamId, project: projectId });

        if (evaluation) {
            console.log(`[DB] Updating existing evaluation for team: ${teamId}`);
            evaluation.grade = grade;
            evaluation.feedback = feedback;
            evaluation.criteria = criteria;
            await evaluation.save();
        } else {
            console.log(`[DB] Creating new evaluation for team: ${teamId}`);
            evaluation = await TeamEvaluation.create({
                team: teamId,
                faculty: req.user._id,
                project: projectId,
                grade,
                feedback,
                criteria
            });
        }

        // Log Activity for Transparency
        await TeamActivity.create({
            team: teamId,
            user: req.user._id,
            type: 'STATUS_CHANGE',
            description: `Faculty submitted evaluation: Grade ${grade}`,
            metadata: { evaluationId: evaluation._id, grade }
        });

        // Notify Team Members
        const team = await Team.findById(teamId);
        if (team) {
            console.log(`[NOTIFY] Dispatching signals to ${team.members.length} squadron members`);
            const notificationPromises = team.members.map(member => {
                return Notification.create({
                    userId: member.user, // Corrected from recipient
                    sender: req.user._id,
                    type: 'system',
                    title: 'Project Evaluation Submitted',
                    message: `Professor ${req.user.name} has submitted an evaluation for your project.`,
                    link: '/student/dashboard/team'
                }).catch(err => console.error(`[NOTIFY_ERROR] Failed to signal user ${member.user}:`, err));
            });
            await Promise.all(notificationPromises);

            // Emit socket events for real-time dashboard updates
            const io = req.app.get('socketio');
            if (io) {
                console.log(`[SOCKET] Projecting evaluation update to team channel: project:${teamId}`);
                io.to(`project:${teamId}`).emit('evaluation_updated', evaluation);
            }
        }

        res.status(200).json(evaluation);
    } catch (error) {
        console.error("[CONTROLLER_ERROR] Evaluation submission failure:", error);
        res.status(500);
        throw new Error(`Evaluation Core Failure: ${error.message}`);
    }
});

module.exports = {
    getTeamsForEvaluation,
    submitEvaluation
};
