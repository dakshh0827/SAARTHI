import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { can, filterDataByRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authMiddleware);

// Get all alerts
router.get('/', can.viewAlerts, async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, isResolved } = req.query;
    const skip = (page - 1) * limit;
    const roleFilter = filterDataByRole(req);

    const where = {
      equipment: roleFilter,
      ...(severity && { severity }),
      ...(isResolved !== undefined && { isResolved: isResolved === 'true' }),
    };

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          equipment: {
            select: { equipmentId: true, name: true, location: true },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alert.count({ where }),
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch alerts.', error: error.message });
  }
});

// Resolve alert
router.put('/:id/resolve', can.manageAlerts, async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user.email },
    });
    res.json({
      success: true,
      message: 'Alert resolved successfully.',
      data: alert,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to resolve alert.', error: error.message });
  }
});

export default router;
