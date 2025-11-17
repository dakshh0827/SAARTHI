// =====================================================
// src/stores/dashboardStore.js (FIXED)
// =====================================================
import { create } from "zustand";
import api from "../lib/axios";

export const useDashboardStore = create((set) => ({
  overview: null,
  realtimeStatus: [],
  sensorData: {},
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('📊 Fetching dashboard overview...');
      const response = await api.get("/monitoring/dashboard");
      console.log('✅ Dashboard overview fetched:', response.data);
      
      set({ 
        overview: response.data.data, 
        isLoading: false,
        error: null 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard overview:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch overview'
      });
      throw error;
    }
  },

  fetchRealtimeStatus: async () => {
    try {
      console.log('📊 Fetching realtime status...');
      const response = await api.get("/monitoring/realtime");
      console.log('✅ Realtime status fetched');
      
      set({ realtimeStatus: response.data.data });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching realtime status:', error);
      throw error;
    }
  },

  fetchSensorData: async (equipmentId, hours = 24) => {
    try {
      console.log(`📊 Fetching sensor data for ${equipmentId}...`);
      const response = await api.get(`/monitoring/sensor/${equipmentId}`, {
        params: { hours },
      });
      console.log('✅ Sensor data fetched');
      
      set((state) => ({
        sensorData: {
          ...state.sensorData,
          [equipmentId]: response.data.data,
        },
      }));
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sensor data:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    overview: null,
    realtimeStatus: [],
    sensorData: {},
    isLoading: false,
    error: null,
  }),
}));