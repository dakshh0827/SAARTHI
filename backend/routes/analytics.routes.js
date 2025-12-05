import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import authMiddleware from '../middlewares/auth.js';
import { can } from '../middlewares/rbac.js';

const router = express.Router();
router.use(authMiddleware);

// Get analytics overview
router.get('/overview', can.viewBasicAnalytics, analyticsController.getAnalyticsOverview);

// Get equipment-specific analytics
router.get(
  '/equipment/:id',
  can.viewDetailedAnalytics,
  analyticsController.getEquipmentAnalytics
);

// NEW: Get predictive maintenance data for a specific lab
router.get(
  '/predictive/:labId', 
  can.viewDetailedAnalytics, 
  analyticsController.getLabPredictiveAnalytics
);

export default router;