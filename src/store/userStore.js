import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../lib/apiClient';

/**
 * 👥 User Store - Manages user profile data and operations
 * 
 * Features:
 * - User profile management
 * - User list management
 * - Cached data with TTL
 * - Real-time user status tracking
 */

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      users: new Map(), // Cache of all users
      userProfiles: {}, // Detailed profiles by userId
      isLoadingUsers: false,
      isLoadingProfile: false,
      error: null,
      lastUpdated: {}, // Track when each user was fetched

      // ========== ACTIONS ==========

      /**
       * Fetch user profile
       */
      fetchUserProfile: async (userId) => {
        set({ isLoadingProfile: true, error: null });

        try {
          const response = await apiClient.get(`/user/${userId}`);

          if (response.data.user) {
            set((state) => ({
              userProfiles: {
                ...state.userProfiles,
                [userId]: response.data.user,
              },
              lastUpdated: {
                ...state.lastUpdated,
                [userId]: Date.now(),
              },
            }));

            return response.data.user;
          }
        } catch (err) {
          const errorMsg = err.response?.data?.msg || err.message || 'Failed to fetch profile';
          set({ error: errorMsg });
          console.error('❌ Fetch profile error:', errorMsg);
          throw err;
        } finally {
          set({ isLoadingProfile: false });
        }
      },

      /**
       * Update user profile
       */
      updateUserProfile: async (userId, profileData) => {
        set({ isLoadingProfile: true, error: null });

        try {
          const response = await apiClient.put(`/user/${userId}`, profileData);

          if (response.data.user) {
            set((state) => ({
              userProfiles: {
                ...state.userProfiles,
                [userId]: response.data.user,
              },
            }));

            return response.data.user;
          }
        } catch (err) {
          const errorMsg = err.response?.data?.msg || err.message || 'Failed to update profile';
          set({ error: errorMsg });
          console.error('❌ Update profile error:', errorMsg);
          throw err;
        } finally {
          set({ isLoadingProfile: false });
        }
      },

      /**
       * Fetch user list (all users or filtered)
       */
      fetchUsers: async (filters = {}) => {
        set({ isLoadingUsers: true, error: null });

        try {
          const params = new URLSearchParams(filters).toString();
          const url = `/user/list?${params}`;

          const response = await apiClient.get(url);

          if (Array.isArray(response.data.users)) {
            const usersMap = new Map(response.data.users.map((u) => [u._id, u]));

            set({
              users: usersMap,
              lastUpdated: {
                ...get().lastUpdated,
                'all-users': Date.now(),
              },
            });

            return response.data.users;
          }
        } catch (err) {
          const errorMsg = err.response?.data?.msg || err.message || 'Failed to fetch users';
          set({ error: errorMsg });
          console.error('❌ Fetch users error:', errorMsg);
          throw err;
        } finally {
          set({ isLoadingUsers: false });
        }
      },

      /**
       * Get cached user or null
       */
      getUser: (userId) => {
        const state = get();
        const user = state.users.get(userId);

        // Check if cache is stale (older than 5 minutes)
        const lastFetch = state.lastUpdated[userId] || 0;
        const isCacheStale = Date.now() - lastFetch > 5 * 60 * 1000;

        if (!user || isCacheStale) {
          // Return null, trigger fetch in component
          return null;
        }

        return user;
      },

      /**
       * Get cached user profile
       */
      getUserProfile: (userId) => {
        return get().userProfiles[userId] || null;
      },

      /**
       * Cache user data
       */
      cacheUser: (userId, userData) => {
        set((state) => ({
          users: new Map(state.users).set(userId, userData),
          lastUpdated: {
            ...state.lastUpdated,
            [userId]: Date.now(),
          },
        }));
      },

      /**
       * Clear user cache
       */
      clearUserCache: (userId) => {
        set((state) => ({
          users: new Map([...state.users].filter(([id]) => id !== userId)),
          userProfiles: Object.fromEntries(
            Object.entries(state.userProfiles).filter(([id]) => id !== userId)
          ),
          lastUpdated: Object.fromEntries(
            Object.entries(state.lastUpdated).filter(([id]) => id !== userId)
          ),
        }));
      },

      /**
       * Clear all user cache
       */
      clearAllCache: () => {
        set({
          users: new Map(),
          userProfiles: {},
          lastUpdated: {},
        });
      },

      /**
       * Set error
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-API data
        userProfiles: state.userProfiles,
      }),
    }
  )
);

export default useUserStore;
