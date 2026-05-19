const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý mã giảm giá
 */

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Lấy các mã giảm giá hợp lệ
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: Danh sách các mã giảm giá hợp lệ
 *   post:
 *     summary: Tạo mã giảm giá mới (Quản trị viên/Nhân viên)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [percent, fixed]
 *               value:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *               usage_limit:
 *                 type: integer
 *               start_at:
 *                 type: string
 *                 format: date-time
 *               end_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       403:
 *         description: Bị cấm
 */
router.get('/', voucherController.getVouchers);
router.post('/', verifyToken, authorize(['admin', 'employee']), voucherController.createVoucher);

/**
 * @swagger
 * /api/vouchers/check:
 *   post:
 *     summary: Xác thực mã giảm giá
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *               orderValue:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mã giảm giá hợp lệ
 *       400:
 *         description: Không hợp lệ hoặc không đủ điều kiện
 *       404:
 *         description: Không tìm thấy
 */
router.post('/check', voucherController.checkVoucher);

/**
 * @swagger
 * /api/vouchers/admin:
 *   get:
 *     summary: Lấy tất cả mã giảm giá (Quản trị viên/Nhân viên)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả mã giảm giá
 */
router.get('/admin', verifyToken, authorize(['admin', 'employee']), voucherController.getAllVouchersAdmin);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   put:
 *     summary: Cập nhật mã giảm giá (Quản trị viên/Nhân viên)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usage_limit:
 *                 type: integer
 *               min_order_value:
 *                 type: number
 *               start_at:
 *                 type: string
 *                 format: date-time
 *               end_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa mã giảm giá (Quản trị viên/Nhân viên)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.put('/:id', verifyToken, authorize(['admin', 'employee']), voucherController.updateVoucher);
router.delete('/:id', verifyToken, authorize(['admin', 'employee']), voucherController.deleteVoucher);

module.exports = router;
