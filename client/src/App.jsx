import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

// Core Pages
import Hero from './components/Hero';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';

// Feature-Sliced Routes
import StudentRoutes from './routes/StudentRoutes';
import CompanyRoutes from './routes/CompanyRoutes';
import FacultyRoutes from './routes/FacultyRoutes';
import AdminRoutes from './routes/AdminRoutes';

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

// Public Layout
const PublicLayout = () => (
  <>
    <Navbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={user ? (user.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />) : <Hero />} />
        <Route path="/login" element={user ? (user.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/" replace />) : <Login />} />
        <Route path="/register" element={user ? (user.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/" replace />) : <Register />} />
        <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Feature-Sliced Role Routes */}
      <Route element={<PrivateRoute allowedRoles={['student']} />}>
        <Route path="/student/*" element={<StudentRoutes />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['company']} />}>
        <Route path="/company/*" element={<CompanyRoutes />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['faculty']} />}>
        <Route path="/faculty/*" element={<FacultyRoutes />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
