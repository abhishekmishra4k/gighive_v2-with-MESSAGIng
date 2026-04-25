import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export function ProtectedRoute({ children }) {
  const { token, isAuthenticated } = useAuthStore();

  const isValidJWT = token && typeof token === 'string' && token.split('.').length === 3;

  if (!isValidJWT) {
    console.warn('⛔ Invalid or missing token. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  return children;
}
export default ProtectedRoute;