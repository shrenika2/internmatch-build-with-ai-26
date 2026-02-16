const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const TeamEvaluation = require('../models/TeamEvaluation');
const TeamActivity = require('../models/TeamActivity');
const Notification = require('../models/Notification');

// @desc    Get all teams for a project (for evaluation)
// @route   GET /api/evaluations/project/:projectId
const getTeamsForEvaluation = asyncHandler(async (req, res) => {
    const teams = await Team.find({ opportunity: req.params.projectId })
        .populate('members.user', 'name studentProfile')
        .populate('leader', 'name');

    const evaluations = await TeamEvaluation.find({ project: req.params.projectId });

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
    const { teamId, projectId, grade, feedback, criteria } = req.body;

    let evaluation = await TeamEvaluation.findOne({ team: teamId, project: projectId });

    if (evaluation) {
        evaluation.grade = grade;
        evaluation.feedback = feedback;
        evaluation.criteria = criteria;
        await evaluation.save();
    } else {
        evaluation = await TeamEvaluation.create({
            team: teamId,
            faculty: req.user._id,
            project: projectId,
            grade,
            feedback,
            criteria
        });
    }

    // Log Activity
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
        const notificationPromises = team.members.map(member => {
            return Notification.create({
                recipient: member.user,
                sender: req.user._id,
                type: 'system',
                title: 'Project Evaluation Submitted',
                message: `Professor ${req.user.name} has submitted an evaluation for your project.`,
                link: '/student/dashboard/team'
            });
        });
        await Promise.all(notificationPromises);

        // Emit socket events
        const io = req.app.get('socketio');
        if (io) {
            io.to(`project:${teamId}`).emit('evaluation_updated', evaluation);
        }
    }

    res.status(200).json(evaluation);
});

module.exports = {
    getTeamsForEvaluation,
    submitEvaluation
};
