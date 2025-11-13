import prisma from "../config/database.js";
import logger from "../utils/logger.js";
import { USER_ROLE_ENUM } from "../utils/constants.js";
import { filterLabsByRole } from "../middlewares/rbac.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class LabController {
  /**
   * Create a new lab. (POLICY_MAKER ONLY)
   */
  createLab = asyncHandler(async (req, res) => {
    const { labId, name, institute, department } = req.body;

    // Check if public labId is unique
    const existingLabId = await prisma.lab.findUnique({
      where: { labId },
    });
    if (existingLabId) {
      return res.status(409).json({
        success: false,
        message: "A lab with this Lab ID already exists.",
      });
    }

    // Check for duplicate name within the same institute and department
    const existingNameInDept = await prisma.lab.findFirst({
      where: { name, institute, department },
    });
    if (existingNameInDept) {
      return res.status(409).json({
        success: false,
        message: `A lab named "${name}" already exists in ${department} at ${institute}.`,
      });
    }

    const lab = await prisma.lab.create({
      data: {
        labId,
        name,
        institute,
        department,
      },
    });

    logger.info(
      `Lab created: ${name} (${labId}) in ${department}, ${institute} by ${req.user.email}`
    );
    res.status(201).json({ success: true, data: lab });
  });

  /**
   * Get all labs.
   * - POLICY_MAKER: Gets all labs (can filter by institute/department)
   * - LAB_MANAGER: Gets labs in their institute and department
   * - TRAINER: Gets their own lab only
   */
  getAllLabs = asyncHandler(async (req, res) => {
    const { institute, department } = req.query;

    // Base filter from RBAC
    let where = filterLabsByRole(req);

    // Apply additional filters for POLICY_MAKER
    if (req.user.role === USER_ROLE_ENUM.POLICY_MAKER) {
      if (institute) {
        where.institute = institute;
      }
      if (department) {
        where.department = department;
      }
    }

    const labs = await prisma.lab.findMany({
      where,
      include: {
        _count: {
          select: {
            equipments: { where: { isActive: true } },
            trainers: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ institute: "asc" }, { department: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, data: labs });
  });

  /**
   * Get a single lab by its public labId.
   */
  getLabById = asyncHandler(async (req, res) => {
    const { labId } = req.params;

    // Base filter from RBAC
    const roleFilter = filterLabsByRole(req);

    const lab = await prisma.lab.findFirst({
      where: { labId: labId, ...roleFilter },
      include: {
        equipments: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            equipmentId: true,
            department: true,
            status: { select: { status: true, healthScore: true } },
          },
        },
        trainers: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found or access denied.",
      });
    }

    res.json({ success: true, data: lab });
  });

  /**
   * Update a lab. (POLICY_MAKER ONLY)
   */
  updateLab = asyncHandler(async (req, res) => {
    const { labId } = req.params;
    const { name, institute, department } = req.body;

    // Find the lab first
    const existingLab = await prisma.lab.findUnique({
      where: { labId: labId },
    });

    if (!existingLab) {
      return res
        .status(404)
        .json({ success: false, message: "Lab not found." });
    }

    // Check if new name is a duplicate within the same institute and department
    if (name && name !== existingLab.name) {
      const existingNameInDept = await prisma.lab.findFirst({
        where: {
          name,
          institute: institute || existingLab.institute,
          department: department || existingLab.department,
          NOT: { labId: labId },
        },
      });
      if (existingNameInDept) {
        return res.status(409).json({
          success: false,
          message: `A lab named "${name}" already exists in this department at this institute.`,
        });
      }
    }

    try {
      const lab = await prisma.lab.update({
        where: { labId: labId },
        data: {
          ...(name && { name }),
          ...(institute && { institute }),
          ...(department && { department }),
        },
      });
      logger.info(`Lab updated: ${lab.labId} by ${req.user.email}`);
      res.json({ success: true, data: lab });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ success: false, message: "Lab not found." });
      }
      throw error;
    }
  });

  /**
   * Delete a lab. (POLICY_MAKER ONLY)
   */
  deleteLab = asyncHandler(async (req, res) => {
    const { labId } = req.params;

    // Check if lab exists
    const lab = await prisma.lab.findFirst({
      where: { labId: labId },
      include: {
        _count: {
          select: { equipments: true, trainers: true },
        },
      },
    });

    if (!lab) {
      return res
        .status(404)
        .json({ success: false, message: "Lab not found." });
    }

    if (lab._count.equipments > 0 || lab._count.trainers > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete lab. Reassign all equipment and trainers first.",
        data: {
          equipmentCount: lab._count.equipments,
          trainerCount: lab._count.trainers,
        },
      });
    }

    try {
      await prisma.lab.delete({
        where: { labId: labId },
      });
      logger.info(`Lab deleted: ${labId} by ${req.user.email}`);
      res.json({ success: true, message: "Lab deleted successfully." });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ success: false, message: "Lab not found." });
      }
      throw error;
    }
  });

  /**
   * Get lab summary with equipment analytics
   * Useful for LAB_MANAGER to see their labs' overview
   */
  getLabSummary = asyncHandler(async (req, res) => {
    const { labId } = req.params;

    // Base filter from RBAC
    const roleFilter = filterLabsByRole(req);

    const lab = await prisma.lab.findFirst({
      where: { labId: labId, ...roleFilter },
      include: {
        equipments: {
          where: { isActive: true },
          include: {
            status: true,
            analyticsParams: true,
          },
        },
        trainers: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found or access denied.",
      });
    }

    // Calculate summary statistics
    const totalEquipment = lab.equipments.length;
    const operationalEquipment = lab.equipments.filter(
      (eq) =>
        eq.status?.status === "OPERATIONAL" || eq.status?.status === "IN_USE"
    ).length;
    const inClassEquipment = lab.equipments.filter(
      (eq) => eq.status?.isOperatingInClass
    ).length;
    const avgHealthScore =
      totalEquipment > 0
        ? lab.equipments.reduce(
            (sum, eq) => sum + (eq.status?.healthScore || 0),
            0
          ) / totalEquipment
        : 0;

    // Calculate total uptime and downtime
    const totalUptime = lab.equipments.reduce(
      (sum, eq) => sum + (eq.analyticsParams?.totalUptime || 0),
      0
    );
    const totalDowntime = lab.equipments.reduce(
      (sum, eq) => sum + (eq.analyticsParams?.totalDowntime || 0),
      0
    );

    const summary = {
      lab: {
        id: lab.id,
        labId: lab.labId,
        name: lab.name,
        institute: lab.institute,
        department: lab.department,
      },
      statistics: {
        totalEquipment,
        operationalEquipment,
        inClassEquipment,
        avgHealthScore: Math.round(avgHealthScore),
        totalUptime: Math.round(totalUptime),
        totalDowntime: Math.round(totalDowntime),
        totalTrainers: lab.trainers.length,
      },
      equipment: lab.equipments.map((eq) => ({
        id: eq.id,
        equipmentId: eq.equipmentId,
        name: eq.name,
        status: eq.status?.status || "UNKNOWN",
        healthScore: eq.status?.healthScore || 0,
        isOperatingInClass: eq.status?.isOperatingInClass || false,
        uptime: eq.analyticsParams?.totalUptime || 0,
        downtime: eq.analyticsParams?.totalDowntime || 0,
      })),
    };

    res.json({ success: true, data: summary });
  });
}

export default new LabController();
