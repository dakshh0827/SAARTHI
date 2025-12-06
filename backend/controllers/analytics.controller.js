import prisma from "../config/database.js";
import { filterDataByRole } from "../middlewares/rbac.js";
import mlService from "../services/ml.service.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class AnalyticsController {
  // ... (Keep existing getAnalyticsOverview)
  getAnalyticsOverview = asyncHandler(async (req, res) => {
    const roleFilter = filterDataByRole(req);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const analytics = await prisma.usageAnalytics.aggregate({
      where: {
        equipment: roleFilter,
        date: { gte: thirtyDaysAgo },
      },
      _avg: { utilizationRate: true, efficiency: true },
      _sum: {
        totalUsageHours: true,
        totalDowntime: true,
        energyConsumed: true,
      },
    });

    const data = {
      avgUtilizationRate: analytics._avg.utilizationRate || 0,
      avgEfficiency: analytics._avg.efficiency || 0,
      totalUsageHours: analytics._sum.totalUsageHours || 0,
      totalDowntime: analytics._sum.totalDowntime || 0,
      totalEnergyConsumed: analytics._sum.energyConsumed || 0,
    };
    res.json({ success: true, data });
  });

  // ... (Keep existing getEquipmentAnalytics)
  getEquipmentAnalytics = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const { id } = req.params; 
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const roleFilter = filterDataByRole(req);
    const equipment = await prisma.equipment.findFirst({
      where: { id, ...roleFilter },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found or access denied.",
      });
    }

    const data = await prisma.usageAnalytics.findMany({
      where: {
        equipmentId: id,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    res.json({ success: true, data });
  });

  // ... (Keep existing getDepartmentAnalytics)
  getDepartmentAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const roleFilter = filterDataByRole(req);
    const equipment = await prisma.equipment.findFirst({
      where: { id, ...roleFilter },
      include: { analyticsParams: true },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found or access denied.",
      });
    }

    res.json({
      success: true,
      data: equipment.analyticsParams,
    });
  });

  // --- FIXED METHOD: Predictive Analytics Integration ---
getLabPredictiveAnalytics = asyncHandler(async (req, res) => {
  const { labId } = req.params;

  const equipmentList = await prisma.equipment.findMany({
    where: { 
      lab: { labId: labId },
      isActive: true 
    },
    include: {
      status: true,
      analyticsParams: true,
      maintenanceRecords: {
        orderBy: { maintenanceDate: 'desc' },
        take: 1
      }
    }
  });

  if (!equipmentList.length) {
    return res.json({ success: true, data: [] });
  }

  const predictions = await Promise.all(equipmentList.map(async (eq) => {
    const status = eq.status || {};
    const params = eq.analyticsParams || {};
    
    // Get last maintenance date
    const lastMaintenance = eq.maintenanceRecords[0]?.maintenanceDate || eq.status?.lastMaintenanceDate;
    
    // Calculate days since maintenance
    let daysSinceMaintenance = 0;
    if (lastMaintenance) {
      const diffTime = Math.abs(new Date() - new Date(lastMaintenance));
      daysSinceMaintenance = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Prepare features for ML Model
    const features = {
      temperature: params.temperature || status.temperature || 50,
      vibration: params.vibration || status.vibration || 0,
      energyConsumption: params.energyConsumption || status.energyConsumption || 200,
      daysSinceMaintenance: daysSinceMaintenance
    };

    // Call ML Service
    const mlResult = await mlService.getPrediction(features);

    // Calculate days until maintenance needed
    let daysUntilMaintenance = null;
    if (mlResult.prediction === 1 || mlResult.probability > 70) {
      // Urgent - calculate based on probability
      const urgencyFactor = mlResult.probability / 100;
      daysUntilMaintenance = Math.max(1, Math.floor(7 * (1 - urgencyFactor)));
    } else {
      // Calculate based on maintenance cycle (assume 90 days)
      const maintenanceCycle = 90;
      daysUntilMaintenance = Math.max(0, maintenanceCycle - daysSinceMaintenance);
    }

    return {
      id: eq.id,
      name: eq.name,
      features,
      prediction: {
        ...mlResult,
        daysUntilMaintenance,
        lastMaintenanceDate: lastMaintenance,
        daysSinceMaintenance
      }
    };
  }));

  res.json({ success: true, data: predictions });
});
}

export default new AnalyticsController();