import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminNavbar from '../components/navbars/AdminNavbar';

import AdminDashboard from '../pages/AdminDashboard';

const AdminLayout = () => (
    <div className="min-h-screen bg-[#050505]">
        <AdminNavbar />
        <div className="pt-16">
            <Outlet />
        </div>
    </div>
);

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
