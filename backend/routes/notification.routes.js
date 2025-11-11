import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          alert: {
            include: {
              equipment: { select: { name: true, equipmentId: true } },
            },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user.id, isRead: false },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch notifications.', error: error.message });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to mark notification as read.', error: error.message });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to mark all as read.', error: error.message });
  }
});

export default router;
