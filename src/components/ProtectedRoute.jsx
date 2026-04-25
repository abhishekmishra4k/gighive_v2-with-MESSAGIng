import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/authStore';

/**
 * 🔐 ProtectedRoute Component
 *
 * Wraps routes that require authentication.
 * Redirects to /login if unauthenticated.
 * Redirects to / if authenticated but wrong role.
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();
  const { canAccess } = useAuthStore();

  if (!isAuthenticated || !user) {
    console.warn('⚠️ Unauthorized access attempt — redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !canAccess(requiredRole)) {
    console.warn(`⚠️ Role '${user?.role}' not allowed — required: '${requiredRole}'`);
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * 🔓 PublicRoute Component
 *
 * Redirects already-authenticated users to their role-specific dashboard.
 * student   → /student-dashboard
 * employer  → /employer-dashboard
 * admin     → /admin-dashboard
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const role = user.role || user.userType || 'student';

    const dashboardMap = {
      student:  '/student-dashboard',
      employer: '/employer-dashboard',
      admin:    '/admin-dashboard',
    };

    const destination = dashboardMap[role] || '/student-dashboard';
    console.log(`✅ Already authenticated as ${role} — redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  return children;
}

export default ProtectedRoute;
