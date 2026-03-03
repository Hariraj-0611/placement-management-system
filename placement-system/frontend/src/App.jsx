import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import CompanyDrives from './pages/student/CompanyDrives';
import MyApplications from './pages/student/MyApplications';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffStudents from './pages/staff/Students';
import StaffDrives from './pages/staff/Drives';
import StaffApplications from './pages/staff/Applications';
import StaffProfile from './pages/staff/Profile';

// Placement Pages
import PlacementDashboard from './pages/placement/Dashboard';
import PlacementDrives from './pages/placement/ManageDrives';
import PlacementStudents from './pages/placement/ManageStudents';
import PlacementApplications from './pages/placement/ManageApplications';
import CreateDrive from './pages/placement/CreateDrive';
import ManageUsers from './pages/placement/ManageUsers';
import PlacementProfile from './pages/placement/Profile';

// Common Pages
import Unauthorized from './pages/Unauthorized';

// Home redirect component
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'STUDENT':
      return <Navigate to="/dashboard" replace />;
    case 'STAFF':
      return <Navigate to="/staff/dashboard" replace />;
    case 'PLACEMENT':
      return <Navigate to="/placement/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drives"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CompanyDrives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drives/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CompanyDrives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/students"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/drives"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffDrives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/applications"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffProfile />
                </ProtectedRoute>
              }
            />

            {/* Placement Routes */}
            <Route
              path="/placement/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <PlacementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/drives"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <PlacementDrives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/drives/create"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <CreateDrive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/students"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <PlacementStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/applications"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <PlacementApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/users"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement/profile"
              element={
                <ProtectedRoute allowedRoles={['PLACEMENT']}>
                  <PlacementProfile />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
