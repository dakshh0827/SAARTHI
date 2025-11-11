import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { can, filterDataByRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authMiddleware);

// Get analytics overview
router.get('/overview', can.viewBasicAnalytics, async (req, res) => {
  try {
    const roleFilter = filterDataByRole(req);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const analytics = await prisma.usageAnalytics.aggregate({
      where: {
        equipment: roleFilter,
        date: { gte: thirtyDaysAgo },
      },
      _avg: { utilizationRate: true, efficiency: true },
      _sum: { totalUsageHours: true, totalDowntime: true, energyConsumed: true },
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.', error: error.message });
  }
});

// Get equipment-specific analytics
router.get('/equipment/:id', can.viewDetailedAnalytics, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await prisma.usageAnalytics.findMany({
      where: {
        equipmentId: req.params.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch equipment analytics.', error: error.message });
  }
});

export default router;
