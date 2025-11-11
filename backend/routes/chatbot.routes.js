import express from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Send message to chatbot
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        message,
      },
    });

    let response = "I'm here to help! You can ask me about equipment status, alerts, or analytics.";

    if (message.toLowerCase().includes('status')) {
      response = 'Let me check the equipment status for you...';
    } else if (message.toLowerCase().includes('alert')) {
      response = 'Checking recent alerts...';
    }

    await prisma.chatMessage.update({
      where: { id: chatMessage.id },
      data: { response },
    });

    res.json({ success: true, data: { message, response } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process message.', error: error.message });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat history.', error: error.message });
  }
});

export default router;
