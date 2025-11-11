import express from 'express';
import monitoringController from '../controllers/monitoring.controller.js';
import authMiddleware from '../middleware/auth.js';
import { isAuthenticated } from '../middleware/rbac.js';

const router = express.Router();

// All monitoring routes require authentication
router.use(authMiddleware);

// Get dashboard overview
router.get('/dashboard', isAuthenticated, monitoringController.getDashboardOverview);

// Get real-time equipment status
router.get('/realtime', isAuthenticated, monitoringController.getRealtimeStatus);

// Get sensor data for specific equipment
router.get('/sensor/:equipmentId', isAuthenticated, monitoringController.getSensorData);

// Update equipment status (IoT endpoint - can be public with API key)
router.post('/status/:equipmentId', monitoringController.updateEquipmentStatus);

export default router;
