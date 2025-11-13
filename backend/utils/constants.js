/**
 * User Roles Enum
 * Matches the Prisma schema.
 */
export const USER_ROLE_ENUM = {
  POLICY_MAKER: "POLICY_MAKER", // Can manage labs, view all data
  LAB_MANAGER: "LAB_MANAGER", // Manages equipment in department/institute
  TRAINER: "TRAINER", // Views equipment in their lab
};

/**
 * User Roles as an Array
 */
export const USER_ROLES = Object.values(USER_ROLE_ENUM);

/**
 * Auth Provider Enum
 */
export const AUTH_PROVIDER_ENUM = {
  CREDENTIAL: "CREDENTIAL",
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
};

/**
 * OTP Purpose Enum
 */
export const OTP_PURPOSE_ENUM = {
  REGISTRATION: "REGISTRATION",
  LOGIN: "LOGIN",
};

/**
 * Alert Types Enum
 */
export const ALERT_TYPE = {
  FAULT_DETECTED: "FAULT_DETECTED",
  HIGH_TEMPERATURE: "HIGH_TEMPERATURE",
  ABNORMAL_VIBRATION: "ABNORMAL_VIBRATION",
  HIGH_ENERGY_CONSUMPTION: "HIGH_ENERGY_CONSUMPTION",
  MAINTENANCE_DUE: "MAINTENANCE_DUE",
  WARRANTY_EXPIRING: "WARRANTY_EXPIRING",
  UNSAFE_USAGE: "UNSAFE_USAGE",
  UNSAFE_PATTERN_DETECTED: "UNSAFE_PATTERN_DETECTED",
  EQUIPMENT_OFFLINE: "EQUIPMENT_OFFLINE",
  LOW_HEALTH_SCORE: "LOW_HEALTH_SCORE",
  CUSTOM: "CUSTOM",
};

/**
 * Alert Severity Enum
 */
export const ALERT_SEVERITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

/**
 * Notification Types Enum
 */
export const NOTIFICATION_TYPE = {
  ALERT: "ALERT",
  MAINTENANCE: "MAINTENANCE",
  REPORT: "REPORT",
  SYSTEM: "SYSTEM",
  CHAT: "CHAT",
  UNSAFE_PATTERN: "UNSAFE_PATTERN",
};

/**
 * Department Enum (9 Departments)
 */
export const DEPARTMENT_ENUM = {
  FITTER_MANUFACTURING: "FITTER_MANUFACTURING",
  ELECTRICAL_ENGINEERING: "ELECTRICAL_ENGINEERING",
  WELDING_FABRICATION: "WELDING_FABRICATION",
  TOOL_DIE_MAKING: "TOOL_DIE_MAKING",
  ADDITIVE_MANUFACTURING: "ADDITIVE_MANUFACTURING",
  SOLAR_INSTALLER_PV: "SOLAR_INSTALLER_PV",
  MATERIAL_TESTING_QUALITY: "MATERIAL_TESTING_QUALITY",
  ADVANCED_MANUFACTURING_CNC: "ADVANCED_MANUFACTURING_CNC",
  AUTOMOTIVE_MECHANIC: "AUTOMOTIVE_MECHANIC",
};

/**
 * Maps Department to its equipment name field
 */
export const DEPARTMENT_EQUIPMENT_FIELD_MAP = {
  FITTER_MANUFACTURING: "fitterEquipmentName",
  ELECTRICAL_ENGINEERING: "electricalEquipmentName",
  WELDING_FABRICATION: "weldingEquipmentName",
  TOOL_DIE_MAKING: "toolDieEquipmentName",
  ADDITIVE_MANUFACTURING: "additiveManufacturingEquipmentName",
  SOLAR_INSTALLER_PV: "solarInstallerEquipmentName",
  MATERIAL_TESTING_QUALITY: "materialTestingEquipmentName",
  ADVANCED_MANUFACTURING_CNC: "advancedManufacturingEquipmentName",
  AUTOMOTIVE_MECHANIC: "automotiveEquipmentName",
};

/**
 * Department-specific analytical parameters
 * Defines which parameters are tracked for each department
 */
export const DEPARTMENT_ANALYTICS_CONFIG = {
  FITTER_MANUFACTURING: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["vibration"],
  },
  ELECTRICAL_ENGINEERING: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["voltage", "current", "powerFactor"],
  },
  WELDING_FABRICATION: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["vibration", "arcStability", "weldQuality"],
  },
  TOOL_DIE_MAKING: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["precisionLevel", "surfaceFinish", "vibration"],
  },
  ADDITIVE_MANUFACTURING: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["printQuality", "layerHeight", "materialUsage"],
  },
  SOLAR_INSTALLER_PV: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: [
      "solarEfficiency",
      "powerOutput",
      "batteryHealth",
      "voltage",
      "current",
    ],
  },
  MATERIAL_TESTING_QUALITY: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["testAccuracy", "calibrationStatus", "loadCapacity"],
  },
  ADVANCED_MANUFACTURING_CNC: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: [
      "spindleSpeed",
      "feedRate",
      "toolWear",
      "dimensionalAccuracy",
      "vibration",
    ],
  },
  AUTOMOTIVE_MECHANIC: {
    required: [
      "temperature",
      "efficiency",
      "totalUptime",
      "totalDowntime",
      "utilizationRate",
    ],
    optional: ["enginePerformance", "fuelEfficiency", "vibration"],
  },
};

/**
 * Equipment Status Enum
 */
export const OPERATIONAL_STATUS = {
  OPERATIONAL: "OPERATIONAL",
  IN_USE: "IN_USE",
  IN_CLASS: "IN_CLASS",
  IDLE: "IDLE",
  MAINTENANCE: "MAINTENANCE",
  FAULTY: "FAULTY",
  OFFLINE: "OFFLINE",
  WARNING: "WARNING",
};

/**
 * Maintenance Types
 */
export const MAINTENANCE_TYPE = {
  PREVENTIVE: "PREVENTIVE",
  PREDICTIVE: "PREDICTIVE",
  CORRECTIVE: "CORRECTIVE",
  EMERGENCY: "EMERGENCY",
  ROUTINE: "ROUTINE",
};

/**
 * Report Types
 */
export const REPORT_TYPE = {
  DAILY_SUMMARY: "DAILY_SUMMARY",
  WEEKLY_SUMMARY: "WEEKLY_SUMMARY",
  MONTHLY_SUMMARY: "MONTHLY_SUMMARY",
  EQUIPMENT_HEALTH: "EQUIPMENT_HEALTH",
  MAINTENANCE_HISTORY: "MAINTENANCE_HISTORY",
  USAGE_ANALYTICS: "USAGE_ANALYTICS",
  ALERT_HISTORY: "ALERT_HISTORY",
  ENERGY_CONSUMPTION: "ENERGY_CONSUMPTION",
  DEPARTMENT_SUMMARY: "DEPARTMENT_SUMMARY",
  LIFECYCLE_REPORT: "LIFECYCLE_REPORT",
  CUSTOM: "CUSTOM",
};
