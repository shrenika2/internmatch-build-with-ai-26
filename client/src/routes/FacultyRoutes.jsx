import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import FacultyNavbar from '../components/navbars/FacultyNavbar';

import FacultyDashboard from '../pages/FacultyDashboard';
import Community from '../pages/Community';

const FacultyLayout = () => (
    <>
        <FacultyNavbar />
        <div className="min-h-screen bg-slate-950">
            <Outlet />
        </div>
    </>
);

const FacultyRoutes = () => {
    return (
        <Routes>
            <Route element={<FacultyLayout />}>
                <Route path="dashboard" element={<FacultyDashboard />} />
                <Route path="community" element={<Community />} />
                <Route path="*" element={<Navigate to="/faculty/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default FacultyRoutes;
