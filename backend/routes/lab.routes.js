import express from "express";
import labController from "../controllers/lab.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { labValidation } from "../middlewares/validation.js";

const router = express.Router();
router.use(authMiddleware);

// ONLY POLICY_MAKER can create, update, delete labs
router.post("/", can.manageLabs, labValidation, labController.createLab);

router.put("/:labId", can.manageLabs, labController.updateLab);

router.delete("/:labId", can.manageLabs, labController.deleteLab);

// LAB_MANAGER and POLICY_MAKER can view labs
router.get("/", can.viewLabs, labController.getAllLabs);

router.get("/:labId", can.viewLabs, labController.getLabById);

// Get lab summary with analytics (useful for LAB_MANAGER)
router.get("/:labId/summary", can.viewLabs, labController.getLabSummary);

export default router;
