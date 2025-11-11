import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { can } from '../middleware/rbac.js';

const router = express.Router();
router.use(authMiddleware);

// Generate report
router.post('/generate', can.generateReports, async (req, res) => {
  try {
    const { reportType, dateFrom, dateTo } = req.body;

    const report = await prisma.report.create({
      data: {
        reportType,
        title: `${reportType} Report`,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        generatedBy: req.user.id,
        data: { generated: true, placeholder: 'Report data here' },
      },
    });

    res.status(201).json({ success: true, message: 'Report generated successfully.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
});

// Get all reports
router.get('/', can.viewReports, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { generatedBy: req.user.role === 'POLICY_MAKER' ? undefined : req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports.', error: error.message });
  }
});

export default router;
