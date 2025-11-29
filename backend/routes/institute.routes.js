/*
 * =====================================================
 * backend/routes/institute.routes.js (FIXED)
 * =====================================================
 */
import express from "express";
import instituteController from "../controllers/institute.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { instituteValidation } from "../middlewares/validation.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
// This must be public so users can see the list during Signup
router.get("/", instituteController.getAllInstitutes);

// --- PROTECTED ROUTES ---
// Apply authentication middleware only to routes below this line
router.use(authMiddleware);

// Create institute (Policy Maker only)
router.post(
  "/",
  can.manageInstitutes,
  instituteValidation,
  instituteController.createInstitute
);

// Update institute (Policy Maker only)
router.put(
  "/:instituteId",
  can.manageInstitutes,
  instituteValidation,
  instituteController.updateInstitute
);

// Delete institute (Policy Maker only)
router.delete(
  "/:instituteId",
  can.manageInstitutes,
  instituteController.deleteInstitute
);

export default router;
