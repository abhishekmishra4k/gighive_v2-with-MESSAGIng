import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from './components/employer/ProtectedRoute'; 
import { PostGig } from './components/employer/PostGig';
import  Applications  from './components/employer/Applications.jsx';
import { Profile } from './components/student/Profile';
import  {Messages}  from './components/employer/Messages';
// Layouts
import { PublicLayout } from './components/layout/PublicLayout';

// Public Pages
import { Home } from './components/pages/Home';
import { HowItWorks } from './components/pages/HowItWorks';
import { ForStudents } from './components/pages/ForStudents';
import { ForEmployers } from './components/pages/ForEmployers';
import { PopularGigs } from './components/pages/PopularGigs';
import { AboutUs } from './components/pages/AboutUs';

// Auth Pages
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

// Dashboards
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import  EmployerDashboard  from './components/dashboards/EmployerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (token && role) {
      return { token, id, name, email, role };
    }
    return null;
  });

  const [userType, setUserType] = useState(() => localStorage.getItem('role'));

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);

    // Persist to localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role || type);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name || '');
    localStorage.setItem('userEmail', userData.email || '');
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    localStorage.clear();
  };


  return (
    <Router>
      <Routes>
        {/* Public Routes - All wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/for-students" element={<ForStudents />} />
          <Route path="/for-employers" element={<ForEmployers />} />
          <Route path="/popular-gigs" element={<PopularGigs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/applications" element={<Applications user={user} />} />
          <Route path="/profile/:id" element={<Profile user={user} />} />
          <Route path="/employer-dashboard/messages/:userId" element={<Messages user={user} />} />
          {/* <Route path="/employer-dashboard/messages" element={<Messages user={user} />} /> */}
        </Route>

        {/* Auth routes don't use the main layout */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/student-dashboard/*"
          element={
            user && userType === 'student' ? (
              <StudentDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/employer-dashboard/*"
          element={
            user && userType === 'employer' ? (
              <EmployerDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            user && userType === 'admin' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect based on user type */}
        <Route
          path="/dashboard"
          element={
            user ? (
              userType === 'student' ? (
                <Navigate to="/student-dashboard" />
              ) : userType === 'employer' ? (
                <Navigate to="/employer-dashboard" />
              ) : userType === 'admin' ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
  path="/post-gig"
  element={
    <ProtectedRoute>
      <PostGig />
    </ProtectedRoute>
  }
/>


        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
