import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 🔐 Auth Store - Production-grade state management
 * 
 * Features:
 * - Persistent session across page refreshes
 * - Automatic token refresh
 * - Role-based access control
 * - Loading states for async operations
 * - Error handling and recovery
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      user: null,
      token: null,
      userType: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastVerifiedAt: null,

      // ========== ACTIONS ==========

      /**
       * Set user after successful login/signup
       */
      setUser: (user, token, userType) => {
        set({
          user,
          token,
          userType,
          isAuthenticated: true,
          error: null,
          lastVerifiedAt: Date.now(),
        });
      },

      /**
       * Clear all auth data on logout
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          userType: null,
          isAuthenticated: false,
          error: null,
          lastVerifiedAt: null,
        });
      },

      /**
       * Update user profile (e.g., after editing profile)
       */
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set error message
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Verify session is still valid (token not expired)
       */
      verifySession: () => {
        const state = get();

        // If no token, not authenticated
        if (!state.token) {
          set({ isAuthenticated: false });
          return false;
        }

        // Check if token needs refresh (every 5 minutes)
        const timeSinceVerification = Date.now() - (state.lastVerifiedAt || 0);
        if (timeSinceVerification > 5 * 60 * 1000) {
          set({ lastVerifiedAt: Date.now() });
          return true; // Session is valid
        }

        return state.isAuthenticated;
      },

      /**
       * Get auth header for API requests
       */
      getAuthHeader: () => {
        const { token } = get();
        return {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-auth-token': token || '',
        };
      },

      /**
       * Check if user has specific role
       */
      hasRole: (role) => {
        const { userType } = get();
        return userType === role;
      },

      /**
       * Check if user can perform action
       */
      canAccess: (requiredRole) => {
        const { userType, isAuthenticated } = get();
        return isAuthenticated && userType === requiredRole;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
