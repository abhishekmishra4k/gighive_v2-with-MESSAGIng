import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input }  from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

/**
 * 📝 Signup Component
 *
 * Uses useAuth().signup() → AuthContext → apiClient.
 * No direct axios calls, no local mock UI components.
 */
export function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();

  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirm]  = useState(false);
  const [formData, setFormData] = useState({
    firstName:       '',
    lastName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    agreeToTerms:    false,
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) clearError();
  }, [formData]);

  const displayError = localError || error;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.agreeToTerms) {
      setLocalError('You must agree to the Terms of Service.');
      return;
    }

    try {
      // ✅ Uses AuthContext.signup() → apiClient → no direct axios
      await signup(formData.firstName, formData.lastName, formData.email, formData.password, userType);

      toast.success('Account created! You can now log in.');
      navigate('/login');
    } catch (err) {
      setLocalError(err.response?.data?.msg || err.message || 'Signup failed. Please try again.');
    }
  };

  const roles = [
    { value: 'student',  label: '🎓 Student' },
    { value: 'employer', label: '💼 Employer' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Create Your Account</CardTitle>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Join GigHive and start connecting
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {displayError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {displayError}
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">I am a…</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
                    {roles.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setUserType(r.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                          userType === r.value
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      id="signup-first-name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      id="signup-last-name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    id="signup-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="At least 6 characters"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repeat password"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowConfirm(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary font-medium hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary font-medium hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  id="signup-submit"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Creating Account…
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Signup;
