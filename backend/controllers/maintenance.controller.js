// backend/controllers/maintenance.controller.js - UPDATED
import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { filterDataByRole } from '../middlewares/rbac.js';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class MaintenanceController {
  // Get maintenance logs
  getMaintenanceLogs = asyncHandler(async (req, res) => {
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
  });

  // Create maintenance log
  createMaintenanceLog = asyncHandler(async (req, res) => {
    const log = await prisma.maintenanceLog.create({
      data: {
        ...req.body,
        technicianId: req.user.id,
        scheduledDate: new Date(req.body.scheduledDate),
        ...(req.body.completedDate && { completedDate: new Date(req.body.completedDate) }),
      },
      include: {
        equipment: { select: { name: true, equipmentId: true } },
        technician: { select: { firstName: true, lastName: true } },
      },
    });

    logger.info(`Maintenance log created: ${log.id} by user ${req.user.id}`);
    res.status(201).json({
      success: true,
      message: 'Maintenance log created successfully.',
      data: log,
    });
  });

  // Update maintenance log
  updateMaintenanceLog = asyncHandler(async (req, res) => {
    try {
      const log = await prisma.maintenanceLog.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          ...(req.body.scheduledDate && {
            scheduledDate: new Date(req.body.scheduledDate),
          }),
          ...(req.body.completedDate && {
            completedDate: new Date(req.body.completedDate),
          }),
        },
      });
      logger.info(`Maintenance log updated: ${log.id}`);
      res.json({
        success: true,
        message: 'Maintenance log updated successfully.',
        data: log,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
      }
      throw error;
    }
  });

  // NEW: Mark equipment maintenance (Lab Manager only)
  markMaintenance = asyncHandler(async (req, res) => {
    const { equipmentId } = req.params;
    const { maintenanceType, notes } = req.body;

    // Verify equipment exists and user has access
    const roleFilter = filterDataByRole(req);
    const equipment = await prisma.equipment.findFirst({
      where: { id: equipmentId, ...roleFilter, isActive: true },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found or access denied.',
      });
    }

    // Create maintenance record
    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        equipmentId,
        markedBy: req.user.id,
        maintenanceType: maintenanceType || 'General Maintenance',
        notes,
      },
      include: {
        markedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update equipment status lastMaintenanceDate
    await prisma.equipmentStatus.update({
      where: { equipmentId },
      data: {
        lastMaintenanceDate: maintenanceRecord.maintenanceDate,
      },
    });

    logger.info(`Maintenance marked for equipment ${equipmentId} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Maintenance marked successfully.',
      data: maintenanceRecord,
    });
  });

  // NEW: Get maintenance records for equipment
  getMaintenanceRecords = asyncHandler(async (req, res) => {
    const { equipmentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const roleFilter = filterDataByRole(req);
    const equipment = await prisma.equipment.findFirst({
      where: { id: equipmentId, ...roleFilter, isActive: true },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found or access denied.',
      });
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where: { equipmentId },
        include: {
          markedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { maintenanceDate: 'desc' },
      }),
      prisma.maintenanceRecord.count({ where: { equipmentId } }),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}

export default new MaintenanceController();