import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { filterDataByRole } from '../middleware/rbac.js';

class MonitoringController {
  // Get real-time equipment status
  async getRealtimeStatus(req, res) {
    try {
      const roleFilter = filterDataByRole(req);

      const equipmentStatus = await prisma.equipment.findMany({
        where: { ...roleFilter, isActive: true },
        include: {
          status: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: equipmentStatus.map((eq) => ({
          id: eq.id,
          equipmentId: eq.equipmentId,
          name: eq.name,
          category: eq.category,
          location: eq.location,
          status: eq.status?.status || 'OFFLINE',
          healthScore: eq.status?.healthScore || 0,
          temperature: eq.status?.temperature,
          vibration: eq.status?.vibration,
          energyConsumption: eq.status?.energyConsumption,
          lastUsedAt: eq.status?.lastUsedAt,
          updatedAt: eq.status?.updatedAt,
        })),
      });
    } catch (error) {
      logger.error('Get realtime status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch realtime status.',
        error: error.message,
      });
    }
  }

  // Get equipment sensor data
  async getSensorData(req, res) {
    try {
      const { equipmentId } = req.params;
      const { hours = 24 } = req.query;

      const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

      const sensorData = await prisma.sensorData.findMany({
        where: {
          equipmentId,
          timestamp: { gte: timeThreshold },
        },
        orderBy: { timestamp: 'asc' },
      });

      res.json({
        success: true,
        data: sensorData,
      });
    } catch (error) {
      logger.error('Get sensor data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sensor data.',
        error: error.message,
      });
    }
  }

  // Update equipment status (IoT endpoint)
  async updateEquipmentStatus(req, res) {
    try {
      const { equipmentId } = req.params;
      const {
        status,
        temperature,
        vibration,
        energyConsumption,
        pressure,
        humidity,
        rpm,
        voltage,
        current,
      } = req.body;

      // Find equipment
      const equipment = await prisma.equipment.findFirst({
        where: { equipmentId },
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found.',
        });
      }

      // Update equipment status
      const updatedStatus = await prisma.equipmentStatus.upsert({
        where: { equipmentId: equipment.id },
        update: {
          ...(status && { status }),
          ...(temperature !== undefined && { temperature }),
          ...(vibration !== undefined && { vibration }),
          ...(energyConsumption !== undefined && { energyConsumption }),
          lastUsedAt: new Date(),
        },
        create: {
          equipmentId: equipment.id,
          status: status || 'OPERATIONAL',
          temperature,
          vibration,
          energyConsumption,
        },
      });

      // Store sensor data
      await prisma.sensorData.create({
        data: {
          equipmentId: equipment.id,
          temperature,
          vibration,
          energyConsumption,
          pressure,
          humidity,
          rpm,
          voltage,
          current,
        },
      });

      // Check for anomalies and create alerts
      await this.checkAnomalies(equipment.id, {
        temperature,
        vibration,
        energyConsumption,
      });

      res.json({
        success: true,
        message: 'Equipment status updated successfully.',
        data: updatedStatus,
      });
    } catch (error) {
      logger.error('Update equipment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update equipment status.',
        error: error.message,
      });
    }
  }

  // Check for anomalies and create alerts
  async checkAnomalies(equipmentId, sensorData) {
    try {
      const alerts = [];

      // Temperature threshold (example: > 80°C)
      if (sensorData.temperature && sensorData.temperature > 80) {
        alerts.push({
          equipmentId,
          type: 'HIGH_TEMPERATURE',
          severity: sensorData.temperature > 100 ? 'CRITICAL' : 'HIGH',
          title: 'High Temperature Alert',
          message: `Temperature reading: ${sensorData.temperature}°C`,
        });
      }

      // Vibration threshold (example: > 10 mm/s)
      if (sensorData.vibration && sensorData.vibration > 10) {
        alerts.push({
          equipmentId,
          type: 'ABNORMAL_VIBRATION',
          severity: sensorData.vibration > 15 ? 'CRITICAL' : 'HIGH',
          title: 'Abnormal Vibration Detected',
          message: `Vibration reading: ${sensorData.vibration} mm/s`,
        });
      }

      // Energy consumption threshold (example: > 50 kWh)
      if (sensorData.energyConsumption && sensorData.energyConsumption > 50) {
        alerts.push({
          equipmentId,
          type: 'HIGH_ENERGY_CONSUMPTION',
          severity: 'MEDIUM',
          title: 'High Energy Consumption',
          message: `Energy consumption: ${sensorData.energyConsumption} kWh`,
        });
      }

      // Create alerts in database
      if (alerts.length > 0) {
        await prisma.alert.createMany({
          data: alerts,
        });
      }
    } catch (error) {
      logger.error('Check anomalies error:', error);
    }
  }

  // Get dashboard overview
  async getDashboardOverview(req, res) {
    try {
      const roleFilter = filterDataByRole(req);

      const [
        totalEquipment,
        activeEquipment,
        unresolvedAlerts,
        maintenanceDue,
        avgHealthScore,
        recentAlerts,
        equipmentByStatus,
      ] = await Promise.all([
        prisma.equipment.count({ where: { ...roleFilter, isActive: true } }),
        prisma.equipmentStatus.count({
          where: {
            status: { in: ['OPERATIONAL', 'IN_USE'] },
            equipment: { ...roleFilter, isActive: true },
          },
        }),
        prisma.alert.count({
          where: {
            isResolved: false,
            equipment: roleFilter,
          },
        }),
        prisma.equipmentStatus.count({
          where: {
            nextMaintenanceDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            equipment: { ...roleFilter, isActive: true },
          },
        }),
        prisma.equipmentStatus.aggregate({
          _avg: { healthScore: true },
          where: { equipment: { ...roleFilter, isActive: true } },
        }),
        prisma.alert.findMany({
          where: {
            isResolved: false,
            equipment: roleFilter,
          },
          include: {
            equipment: {
              select: {
                equipmentId: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.equipmentStatus.groupBy({
          by: ['status'],
          where: { equipment: { ...roleFilter, isActive: true } },
          _count: true,
        }),
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalEquipment,
            activeEquipment,
            unresolvedAlerts,
            maintenanceDue,
            avgHealthScore: Math.round(avgHealthScore._avg.healthScore || 0),
          },
          recentAlerts,
          equipmentByStatus: equipmentByStatus.map((s) => ({
            status: s.status,
            count: s._count,
          })),
        },
      });
    } catch (error) {
      logger.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard overview.',
        error: error.message,
      });
    }
  }
}

export default new MonitoringController();
