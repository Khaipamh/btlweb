const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Thống kê Bảng điều khiển Quản trị
 */

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Lấy thống kê bảng điều khiển
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Khoảng thời gian thống kê (mặc định là tháng)
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê
 */
router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;
