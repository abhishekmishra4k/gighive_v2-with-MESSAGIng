import { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import apiClient from '../lib/apiClient';

/**
 * 🔐 Auth Context
 * 
 * Provides authentication functions and state to the entire app
 */

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    clearAuth,
    updateUser,
    setLoading,
    setError,
    clearError,
    verifySession,
  } = useAuthStore();

  // ========== SESSION VERIFICATION ==========
  /**
   * Verify session on app load and periodically
   */
  useEffect(() => {
    const verifyAuth = async () => {
      if (token && isAuthenticated) {
        try {
          // Verify token is still valid
          verifySession();

          // Optional: Verify with backend
          const response = await apiClient.get('/user/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token,
            },
          });

          if (response.data.user) {
            updateUser(response.data.user);
            console.log('✅ Session verified');
          }
        } catch (err) {
          console.error('❌ Session verification failed:', err);
          clearAuth();
        }
      }
    };

    verifyAuth();

    // Verify session every 15 minutes
    const interval = setInterval(verifyAuth, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  // ========== LOGIN FUNCTION ==========
  const login = async (email, password, userType = 'student') => {
    setLoading(true);
    clearError();

    try {
      const response = await apiClient.post('/user/login', {
        email,
        password,
        userType,
      });

      if (response.data.token && response.data.user) {
        setUser(response.data.user, response.data.token, response.data.user.role || userType);
        console.log('✅ Login successful');
        return response.data;
      } else {
        throw new Error(response.data.msg || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Login failed';
      setError(errorMsg);
      console.error('❌ Login error:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== SIGNUP FUNCTION ==========
  const signup = async (firstName, lastName, email, password, userType = 'student') => {
    setLoading(true);
    clearError();

    try {
      const response = await apiClient.post('/user/register', {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: userType,
      });

      if (response.data.success || response.data.user) {
        console.log('✅ Signup successful');
        return response.data;
      } else {
        throw new Error(response.data.msg || 'Signup failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Signup failed';
      setError(errorMsg);
      console.error('❌ Signup error:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== LOGOUT FUNCTION ==========
  const logout = () => {
    clearAuth();
    console.log('✅ Logout successful');
  };

  // ========== UPDATE PROFILE ==========
  const updateProfile = async (profileData) => {
    setLoading(true);
    clearError();

    try {
      const response = await apiClient.put('/user/profile', profileData);

      if (response.data.user) {
        updateUser(response.data.user);
        console.log('✅ Profile updated');
        return response.data.user;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Update failed';
      setError(errorMsg);
      console.error('❌ Profile update error:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== REFRESH TOKEN ==========
  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/user/refresh-token');

      if (response.data.token) {
        // Update token while keeping user data
        setUser(user, response.data.token, userType);
        console.log('✅ Token refreshed');
        return response.data.token;
      }
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      clearAuth();
      throw err;
    }
  };

  // ========== CONTEXT VALUE ==========
  const value = {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    signup,
    logout,
    updateProfile,
    refreshToken,
    clearError,
    verifySession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export default AuthContext;
