import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import CompanyNavbar from '../components/navbars/CompanyNavbar';

import CompanyDashboard from '../pages/CompanyDashboard';
import StudentProfile from '../pages/StudentProfile';
import PostOpportunity from '../pages/PostOpportunity';
import AIShortlist from '../pages/AIShortlist';
import Community from '../pages/Community';

const CompanyLayout = () => (
    <>
        <CompanyNavbar />
        <div className="min-h-screen bg-slate-950">
            <Outlet />
        </div>
    </>
);

const CompanyRoutes = () => {
    return (
        <Routes>
            <Route element={<CompanyLayout />}>
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="student-profile/:studentId" element={<StudentProfile />} />
                <Route path="post-opportunity" element={<PostOpportunity />} />
                <Route path="opportunities/:id/shortlist" element={<AIShortlist />} />
                <Route path="community" element={<Community />} />
                <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default CompanyRoutes;
