// =====================================================
// src/stores/authStore.js (FIXED - Prevent Infinite Loop)
// =====================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isCheckingAuth: false,

      register: async (userData) => {
        try {
          const response = await api.post("/auth/register", userData);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      verifyEmail: async (email, otp) => {
        try {
          const response = await api.post("/auth/verify-email", { email, otp });
          const { accessToken, user } = response.data.data;
          
          set({ 
            user, 
            accessToken, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          // Fetch fresh profile data to ensure institute info is loaded
          try {
            const profileResponse = await api.get("/auth/profile");
            set({ user: profileResponse.data.data });
          } catch (profileError) {
            console.error('Failed to fetch full profile:', profileError);
          }
          
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      resendOtp: async (email) => {
        try {
          const response = await api.post("/auth/resend-otp", { email });
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", { email, password });
          const { accessToken, user } = response.data.data;
          
          set({ 
            user, 
            accessToken, 
            isAuthenticated: true,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        // CRITICAL FIX: Prevent multiple simultaneous calls
        const state = get();
        
        // If already checking auth, don't start another check
        if (state.isCheckingAuth) {
          console.log('⏳ checkAuth already in progress, skipping...');
          return;
        }

        // If we have no token, don't bother checking - just set unauthenticated
        if (!state.accessToken) {
          console.log('🔓 No access token found, setting unauthenticated state');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isCheckingAuth: false,
          });
          return;
        }

        console.log('🔍 Starting checkAuth...');
        
        set({ 
          isLoading: true,
          isCheckingAuth: true 
        });

        try {
          const response = await api.get("/auth/profile");
          
          console.log('✅ checkAuth successful');
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
            isCheckingAuth: false,
          });
        } catch (error) {
          console.log('❌ checkAuth failed:', error.response?.status);
          
          // Only clear auth on actual auth errors (401, 403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              isCheckingAuth: false,
            });
          } else {
            // For other errors (network, server errors), just stop loading
            // Don't clear existing auth state
            set({
              isLoading: false,
              isCheckingAuth: false,
            });
          }
        }
      },

      // Called by axios interceptor after successful token refresh
      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      // Called by axios interceptor when refresh fails
      clearAuth: () => {
        console.log('🧹 Clearing auth state');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isCheckingAuth: false,
          isLoading: false,
        });
      },

      updateProfile: async (data) => {
        try {
          const response = await api.put("/auth/profile", data);
          set({ user: response.data.data });
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const response = await api.put("/auth/change-password", {
            currentPassword,
            newPassword,
          });
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist these fields
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);