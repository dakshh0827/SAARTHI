// =====================================================
// 2. src/stores/authStore.js (FIXED)
// =====================================================

import { create } from "zustand";
import api from "../lib/axios";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isCheckingAuth: false, // Add flag to prevent multiple checkAuth calls

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
      set({ user, accessToken, isAuthenticated: true });
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
      set({ user, accessToken, isAuthenticated: true });
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
      });
    }
  },

  checkAuth: async () => {
    // Prevent multiple simultaneous checkAuth calls
    if (get().isCheckingAuth) {
      return;
    }

    set({ isLoading: true, isCheckingAuth: true });

    try {
      const response = await api.get("/auth/profile");
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
      });
    } catch (error) {
      // Only clear state if it's not a network error
      // This prevents clearing state on temporary network issues
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isCheckingAuth: false,
        });
      } else {
        // For network errors, just stop loading but keep existing state
        set({
          isLoading: false,
          isCheckingAuth: false,
        });
      }
    }
  },

  // Method to update token (called by axios interceptor)
  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  // Method to clear auth (called by axios interceptor on refresh failure)
  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
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
}));
