import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Navbars
import StudentNavbar from './components/navbars/StudentNavbar';
import CompanyNavbar from './components/navbars/CompanyNavbar';
import FacultyNavbar from './components/navbars/FacultyNavbar';
import AdminNavbar from './components/navbars/AdminNavbar';

// Pages
import Hero from './components/Hero';
import Login from './pages/Login';
import Register from './pages/Register';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Community from './pages/Community';
import AIShortlist from './pages/AIShortlist';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import PracticeResources from './pages/PracticeResources';
import PostOpportunity from './pages/PostOpportunity';
import Unauthorized from './pages/Unauthorized';

import Navbar from './components/Navbar';

// Guards
const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

// Layouts
const PublicLayout = () => (
  <>
    <Navbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </>
);

const StudentLayout = () => (
  <>
    <StudentNavbar />
    <div className="min-h-screen bg-slate-950">
      <Outlet />
    </div>
  </>
);

const CompanyLayout = () => (
  <>
    <CompanyNavbar />
    <div className="min-h-screen bg-slate-950">
      <Outlet />
    </div>
  </>
);

const FacultyLayout = () => (
  <>
    <FacultyNavbar />
    <div className="min-h-screen bg-slate-950">
      <Outlet />
    </div>
  </>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505]">
    <AdminNavbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Hero />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />} />
        <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<PrivateRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="opportunities/:id" element={<OpportunityDetail />} />
          <Route path="community" element={<Community />} />
          <Route path="practice" element={<PracticeResources />} />
        </Route>
      </Route>

      {/* Company Routes */}
      <Route path="/company" element={<PrivateRoute allowedRoles={['company']} />}>
        <Route element={<CompanyLayout />}>
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="post-opportunity" element={<PostOpportunity />} />
          <Route path="opportunities/:id/shortlist" element={<AIShortlist />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={<PrivateRoute allowedRoles={['faculty']} />}>
        <Route element={<FacultyLayout />}>
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
