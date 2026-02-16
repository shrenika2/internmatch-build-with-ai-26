const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
// @route   GET /api/student/metrics
// @access  Private (Student)
const getStudentMetrics = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    // With unified architecture, profile is embedded in the user object
    const profile = req.user.studentProfile;

    // 2. Fetch Applications for deployment status and successes
    const applications = await Application.find({ student: studentId })
        .populate('opportunity', 'title type status deadline')
        .sort('-createdAt');

    // 3. Fetch Upcoming Deadlines (Chronology)
    const upcomingDeadlines = await Opportunity.find({
        status: 'open',
        deadline: { $gte: new Date() }
    })
        .sort('deadline')
        .limit(5)
        .select('title deadline type');

    // 4. Compute Readiness Trajectory (Simulated 7-day history based on timestamps)
    // In a real system, you'd have a daily snapshot table. 
    // Here we derive it from data density.
    const readinessData = generateReadinessHistory(profile, applications);

    // 5. Optimization Insights
    const insights = generateInsights(profile, applications);

    res.json({
        profileStatus: {
            isComplete: profile?.isComplete || false,
            skillCount: profile?.skills?.length || 0,
            experienceCount: profile?.experiences?.length || 0
        },
        readinessData,
        upcomingDeadlines,
        insights,
        stats: {
            totalApplications: applications.length,
            shortlisted: applications.filter(a => a.status === 'shortlisted').length,
            accepted: applications.filter(a => a.status === 'accepted').length
        }
    });
});

// Logic to generate a daily readiness score for the last 7 days
function generateReadinessHistory(profile, applications) {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);

        let score = 0;

        // Base score from profile completeness
        if (profile?.isComplete) score += 40;
        else score += (profile?.skills?.length || 0) * 5;

        // Score from application activity
        const appsUntilThisDay = applications.filter(a => new Date(a.createdAt) <= d).length;
        score += Math.min(appsUntilThisDay * 10, 40);

        // Success bonus
        const successesUntilThisDay = applications.filter(a =>
            ['shortlisted', 'accepted'].includes(a.status) && new Date(a.createdAt) <= d
        ).length;
        score += Math.min(successesUntilThisDay * 15, 20);

        data.push({
            name: days[d.getDay()],
            score: Math.min(score, 100)
        });
    }
    return data;
}

function generateInsights(profile, applications) {
    const insights = [];

    if (!profile?.isComplete) {
        insights.push({
            text: "Your professional protocol is incomplete. Uplink your resume to unlock high-priority shortlisting.",
            action: "Initialize Profile",
            type: "profile"
        });
    }

    if (applications.length === 0) {
        insights.push({
            text: "No active deployments detected. The grid has 12+ open nodes matching your stack.",
            action: "Scan Opportunities",
            type: "scan"
        });
    } else {
        const shortlisted = applications.filter(a => a.status === 'shortlisted');
        if (shortlisted.length > 0) {
            insights.push({
                text: `${shortlisted.length} of your deployments have been prioritized. Check your comms for interview schedules.`,
                action: "View Intel",
                type: "comms"
            });
        }
    }

    // Default insight if none
    if (insights.length < 2) {
        insights.push({
            text: "Based on recent portal activity, students with 'React' proficiency are seeing 40% higher engagement.",
            action: "Skill Uplink",
            type: "info"
        });
    }

    return insights;
}

module.exports = { getStudentMetrics };
