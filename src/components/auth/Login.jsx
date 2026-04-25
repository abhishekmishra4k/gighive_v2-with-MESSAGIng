import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input }  from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';
import { pageVariants, fadeUp, staggerContainer, cardVariants } from '../../lib/animations';

/**
 * 🔐 Login Component
 *
 * Uses useAuth() from AuthContext which internally calls the Zustand store.
 * No direct axios calls, no manual localStorage operations.
 * Supports two-step: credentials → OTP verify.
 */
export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType]         = useState('student');
  const [loginStep, setLoginStep]       = useState('credentials'); // 'credentials' | 'otp'
  const [otp, setOtp]                   = useState('');
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [localError, setLocalError]     = useState('');

  // Auto-clear auth context error when user edits
  useEffect(() => {
    if (error) clearError();
  }, [formData]);

  const displayError = localError || error;

  const handleInputChange = (e) => {
    setLocalError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Step 1: Submit credentials ────────────
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      // ✅ Uses AuthContext.login() → apiClient → Zustand store
      const data = await login(formData.email, formData.password, userType);

      if (data?.token && data?.user) {
        // If server returns token immediately (no OTP), navigate to dashboard
        const role = data.user.role || userType;
        const dashMap = { student: '/student-dashboard', employer: '/employer-dashboard', admin: '/admin-dashboard' };
        toast.success(`Welcome back, ${data.user.name || 'User'}!`);
        navigate(dashMap[role] || '/student-dashboard', { replace: true });
      } else if (data?.success) {
        // Server sent OTP — move to step 2
        setLoginStep('otp');
        toast.info(data.msg || 'OTP sent to your email!');
      }
    } catch (err) {
      setLocalError(err.response?.data?.msg || err.message || 'Login failed. Please try again.');
    }
  };

  // ─── Step 2: Verify OTP ────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      // ✅ Uses apiClient (auto token injection) for OTP verification
      const res = await apiClient.post('/user/verify-otp', {
        email: formData.email,
        otp,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error('Invalid OTP response from server.');
      }

      // ✅ Persist user + token into Zustand store via AuthContext login's setUser
      // We call login again so the store is populated (OTP returns fresh token)
      const { setUser } = (await import('../../store/authStore')).useAuthStore.getState();
      setUser(user, token, user.role || userType);

      const role = user.role || userType;
      const dashMap = { student: '/student-dashboard', employer: '/employer-dashboard', admin: '/admin-dashboard' };
      toast.success(`Welcome, ${user.name || 'User'}!`);
      navigate(dashMap[role] || '/student-dashboard', { replace: true });

    } catch (err) {
      setLocalError(err.response?.data?.msg || err.message || 'OTP verification failed.');
    }
  };

  // ─── Role selector tabs ─────────────────────
  const roles = [
    { value: 'student',  label: '🎓 Student' },
    { value: 'employer', label: '💼 Employer' },
    { value: 'admin',    label: '⚙️ Admin' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {loginStep === 'credentials' ? 'Sign In to GigHive' : 'Enter OTP'}
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {loginStep === 'credentials'
                  ? 'Access your dashboard instantly'
                  : `We sent a 6-digit code to ${formData.email}`}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Animated Error */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {displayError}
                  </motion.div>
                )}
              </AnimatePresence>

              {loginStep === 'credentials' ? (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  {/* Role Selector */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
                      {roles.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setUserType(r.value)}
                          className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
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

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      id="login-email"
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
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Your password"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    id="login-submit"
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Signing in…</span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-medium hover:underline">
                      Sign up
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">One-Time Password</label>
                    <Input
                      id="otp-input"
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Verifying…</span>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => { setLoginStep('credentials'); setOtp(''); setLocalError(''); }}
                  >
                    Back to login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
