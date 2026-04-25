import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Eye, EyeOff } from 'lucide-react';

/**
 * 🔐 Login Component - Production-Grade Authentication
 * 
 * Uses the new Auth Context for state management
 */

export function LoginNew() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Handle input change
  const handleInputChange = (e) => {
    clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login(formData.email, formData.password, userType);

      // Clear form
      setFormData({ email: '', password: '' });

      // Navigate to dashboard
      const dashboardRoute =
        userType === 'student'
          ? '/student-dashboard'
          : userType === 'employer'
            ? '/employer-dashboard'
            : '/admin-dashboard';

      navigate(dashboardRoute, { replace: true });
    } catch (err) {
      // Error is already set in store by useAuth hook
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome Back 👋
          </CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your GigHive account</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex justify-between items-center">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* User Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Login as
              </label>
              <div className="flex gap-3">
                {['student', 'employer', 'admin'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      clearError();
                    }}
                    className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors ${userType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginNew;
