import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import StudentNavbar from '../components/navbars/StudentNavbar';

import StudentDashboard from '../pages/StudentDashboard';
import DashboardOverview from '../features/dashboard/DashboardOverview';
import ProfilePage from '../features/profile/ProfilePage';
import TeamHub from '../features/team/TeamHub';
import ExperienceWall from '../features/experience/ExperienceWall';
import GuidanceHub from '../pages/GuidanceHub';
import Opportunities from '../pages/Opportunities';
import OpportunityDetail from '../pages/OpportunityDetail';
import Community from '../pages/Community';
import NotificationHistory from '../pages/NotificationHistory';
import PracticeResources from '../pages/PracticeResources';
import PracticeArena from '../pages/PracticeArena';
import InterviewPipeline from '../pages/InterviewPipeline';
import StudentWorkspace from '../features/workspace/pages/StudentWorkspace';

// Mock Interview Views
import SkillInput from '../pages/mock-interview/SkillInput';
import Interview from '../pages/mock-interview/Interview';
import Results from '../pages/mock-interview/Results';

const StudentLayout = () => (
    <>
        <StudentNavbar />
        <div className="min-h-screen bg-slate-950">
            <Outlet />
        </div>
    </>
);

const StudentRoutes = () => {
    return (
        <Routes>
            <Route element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboard />}>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<DashboardOverview />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="team" element={<TeamHub />} />
                    <Route path="experience" element={<ExperienceWall />} />
                    <Route path="guidance" element={<GuidanceHub />} />
                </Route>
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="opportunities/:id" element={<OpportunityDetail />} />
                <Route path="community" element={<Community />} />
                <Route path="notifications" element={<NotificationHistory />} />
                <Route path="practice" element={<PracticeResources />} />
                <Route path="arena/:companyId" element={<PracticeArena />} />
                <Route path="interview-pipeline" element={<InterviewPipeline />} />
                <Route path="workspace" element={<StudentWorkspace />} />

                {/* AI Mock Interview Module */}
                <Route path="mock-interview/setup" element={<SkillInput />} />
                <Route path="mock-interview/live" element={<Interview />} />
                <Route path="mock-interview/results/:id" element={<Results />} />

                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default StudentRoutes;
