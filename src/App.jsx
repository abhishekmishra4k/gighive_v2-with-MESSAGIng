import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { useLayoutEffect } from 'react';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';

// Public Pages
import { Home }         from './components/pages/Home';
import { HowItWorks }   from './components/pages/HowItWorks';
import { ForStudents }  from './components/pages/ForStudents';
import { ForEmployers } from './components/pages/ForEmployers';
import { PopularGigs }  from './components/pages/PopularGigs';
import { AboutUs }      from './components/pages/AboutUs';

// Auth Pages
import { Login }  from './components/auth/Login';
import { Signup } from './components/auth/Signup';

// Protected Pages
import { PostGig }     from './components/employer/PostGig';
import Applications    from './components/employer/Applications.jsx';
import { Profile }     from './components/student/Profile';
import { Messages }    from './components/employer/Messages';

// Dashboards
import { StudentDashboard }  from './components/dashboards/StudentDashboard';
import EmployerDashboard     from './components/dashboards/EmployerDashboard';
import { AdminDashboard }    from './components/dashboards/AdminDashboard';

/**
 * 🔐 App Component — Auth-provider wrapper + animated route transitions
 */
function AppRoutes() {
  const location = useLocation();

  // Create a base key so dashboards don't remount on inner navigations
  const getLayoutKey = (pathname) => {
    if (pathname.startsWith('/student-dashboard')) return 'student-dashboard';
    if (pathname.startsWith('/employer-dashboard')) return 'employer-dashboard';
    if (pathname.startsWith('/admin-dashboard')) return 'admin-dashboard';
    return pathname;
  };
  const layoutKey = getLayoutKey(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={layoutKey}>
        {/* ─── Public Routes ─── */}
        <Route element={<PublicLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/how-it-works"   element={<HowItWorks />} />
          <Route path="/for-students"   element={<ForStudents />} />
          <Route path="/for-employers"  element={<ForEmployers />} />
          <Route path="/popular-gigs"   element={<PopularGigs />} />
          <Route path="/about-us"       element={<AboutUs />} />
          <Route path="/applications"   element={<Applications />} />
          <Route path="/profile/:id"    element={<Profile />} />
          <Route
            path="/employer-dashboard/messages/:userId"
            element={
              <ProtectedRoute requiredRole="employer">
                <Messages />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ─── Auth Routes (redirect away if already logged in) ─── */}
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* ─── Protected Dashboard Routes ─── */}
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-dashboard/*"
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ─── Protected Other Pages ─── */}
        <Route
          path="/post-gig"
          element={
            <ProtectedRoute requiredRole="employer">
              <PostGig />
            </ProtectedRoute>
          }
        />

        {/* ─── Redirects ─── */}
        <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

