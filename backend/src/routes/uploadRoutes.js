const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Quản lý Tệp và Hình ảnh
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageFile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Tên tệp
 *         url:
 *           type: string
 *           description: URL truy cập
 *         folder:
 *           type: string
 *           description: Tên thư mục
 */

/**
 * @swagger
 * /api/uploads/images:
 *   get:
 *     summary: Liệt kê tất cả hình ảnh đã tải lên
 *     tags: [Uploads]
 *     responses:
 *       200:
 *         description: Danh sách hình ảnh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ImageFile'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/images', uploadController.listImages);

module.exports = router;
