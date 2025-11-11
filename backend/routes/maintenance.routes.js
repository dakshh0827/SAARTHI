import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { can, filterDataByRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authMiddleware);

// Get maintenance logs
router.get('/', can.viewMaintenance, async (req, res) => {
  try {
    const { page = 1, limit = 20, equipmentId, status, type } = req.query;
    const skip = (page - 1) * limit;
    const roleFilter = filterDataByRole(req);

    const where = {
      equipment: roleFilter,
      ...(equipmentId && { equipmentId }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        include: {
          equipment: { select: { equipmentId: true, name: true } },
          technician: { select: { firstName: true, lastName: true, email: true } },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance logs.', error: error.message });
  }
});

// Create maintenance log
router.post('/', can.manageMaintenance, async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.create({
      data: {
        ...req.body,
        technicianId: req.user.id,
        scheduledDate: new Date(req.body.scheduledDate),
        ...(req.body.completedDate && { completedDate: new Date(req.body.completedDate) }),
      },
      include: { equipment: true, technician: { select: { firstName: true, lastName: true } } },
    });
    res.status(201).json({ success: true, message: 'Maintenance log created successfully.', data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create maintenance log.', error: error.message });
  }
});

// Update maintenance log
router.put('/:id', can.manageMaintenance, async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        ...(req.body.scheduledDate && { scheduledDate: new Date(req.body.scheduledDate) }),
        ...(req.body.completedDate && { completedDate: new Date(req.body.completedDate) }),
      },
    });
    res.json({ success: true, message: 'Maintenance log updated successfully.', data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update maintenance log.', error: error.message });
  }
});

export default router;
