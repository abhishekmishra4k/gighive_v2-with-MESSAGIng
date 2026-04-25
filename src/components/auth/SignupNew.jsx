import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

/**
 * 📝 Signup Component - Production-Grade Registration
 * 
 * Uses the new Auth Context for state management
 */

export function SignupNew() {
  const navigate = useNavigate();
  const { signup, login, isLoading, error, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Handle input change
  const handleInputChange = (e) => {
    clearError();
    setValidationErrors({});
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Invalid email format';
    }

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms of service';
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Step 1: Sign up
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        userType
      );

      console.log('✅ Signup successful, attempting auto-login...');

      // Step 2: Auto-login after signup
      try {
        await login(formData.email, formData.password, userType);

        // Navigate to dashboard
        const dashboardRoute =
          userType === 'student'
            ? '/student-dashboard'
            : userType === 'employer'
              ? '/employer-dashboard'
              : '/admin-dashboard';

        navigate(dashboardRoute, { replace: true });
      } catch (loginErr) {
        console.log('Auto-login failed, redirecting to login page');
        navigate('/login', { state: { email: formData.email } });
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Error is already set in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Join GigHive 🚀
          </CardTitle>
          <p className="text-gray-600 mt-2">Create your account and start earning</p>
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
                I am a...
              </label>
              <div className="flex gap-3">
                {['student', 'employer'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      clearError();
                    }}
                    className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors ${userType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs">{validationErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs">{validationErrors.lastName}</p>
                )}
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
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs">{validationErrors.email}</p>
              )}
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
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                  clearError();
                }}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {validationErrors.terms && (
              <p className="text-red-500 text-xs">{validationErrors.terms}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password ||
                !agreeToTerms
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-green-600 hover:underline font-medium">
                Sign in here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignupNew;
