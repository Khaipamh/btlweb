const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Tương tác với Chatbot AI
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Gửi tin nhắn đến Chatbot AI
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *       500:
 *         description: Lỗi dịch vụ AI
 */
router.post('/', chatController.chat);

module.exports = router;