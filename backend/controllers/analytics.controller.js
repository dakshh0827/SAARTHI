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
    const { labId } = req.params; // This is the public string ID (e.g., "ATI_MUMBAI_CNC_01")

    // We search for equipment where the *related Lab's* labId matches the parameter
    const equipmentList = await prisma.equipment.findMany({
      where: { 
        lab: {
          labId: labId // <--- FIXED: Filtering via the relation
        },
        isActive: true 
      },
      include: {
        status: true,
        analyticsParams: true
      }
    });

    if (!equipmentList.length) {
      return res.json({ success: true, data: [] });
    }

    // Process each equipment and get predictions
    const predictions = await Promise.all(equipmentList.map(async (eq) => {
      const status = eq.status || {};
      const params = eq.analyticsParams || {};
      
      // A. Calculate Days Since Weekly Maintenance
      let daysSinceMaintenance = 0;
      if (status.lastMaintenanceDate) {
        const diffTime = Math.abs(new Date() - new Date(status.lastMaintenanceDate));
        daysSinceMaintenance = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      // B. Calculate Energy Consumption (Watts)
      let energyWatts = 0;
      if (params.voltage && params.current) {
         energyWatts = params.voltage * params.current; // P = V * I
      } else if (status.energyConsumption) {
         energyWatts = status.energyConsumption; 
      } else {
         energyWatts = 200; // Default nominal value
      }

      // C. Prepare features for ML Model
      const features = {
        temperature: params.temperature || status.temperature || 50,
        vibration: params.vibration || status.vibration || 0,
        energyConsumption: energyWatts,
        daysSinceMaintenance: daysSinceMaintenance
      };

      // D. Call ML Service
      const mlResult = await mlService.getPrediction(features);

      return {
        id: eq.id,
        name: eq.name,
        features,
        prediction: mlResult
      };
    }));

    res.json({ success: true, data: predictions });
  });
}

export default new AnalyticsController();