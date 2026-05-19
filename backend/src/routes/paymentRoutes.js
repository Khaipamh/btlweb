const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Quản lý Thanh toán và Giao dịch
 */

/**
 * @swagger
 * /api/payment/sepay-webhook:
 *   post:
 *     summary: Nhận Webhook cho SePay
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook đã được xử lý
 */
router.post('/sepay-webhook', paymentController.handleSepayWebhook);

/**
 * @swagger
 * /api/payment/transactions:
 *   get:
 *     summary: Lấy tất cả giao dịch (Quản trị viên/Nhân viên)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo ID Đơn hàng/Giao dịch hoặc Email người dùng
 *     responses:
 *       200:
 *         description: Danh sách giao dịch
 */
router.get(
  '/transactions',
  verifyToken,
  authorize(['admin', 'employee']),
  paymentController.getAllTransactions
);

/**
 * @swagger
 * /api/payment/transactions/{id}/approve:
 *   put:
 *     summary: Phê duyệt giao dịch thủ công (Quản trị viên/Nhân viên)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Giao dịch đã được phê duyệt
 */
router.put(
  '/transactions/:id/approve',
  verifyToken,
  authorize(['admin', 'employee']),
  paymentController.approveTransaction
);

/**
 * @swagger
 * /api/payment/transactions/{id}:
 *   delete:
 *     summary: Xóa giao dịch (Quản trị viên/Nhân viên)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Giao dịch đã bị xóa
 */
router.delete(
  '/transactions/:id',
  verifyToken,
  authorize(['admin', 'employee']),
  paymentController.deleteTransaction
);

/**
 * @swagger
 * /api/payment/transactions/fake:
 *   post:
 *     summary: Tạo giao dịch giả để thử nghiệm (Quản trị viên/Nhân viên)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Giao dịch giả đã được tạo
 */
router.post(
  '/transactions/fake',
  verifyToken,
  authorize(['admin', 'employee']),
  paymentController.createFakeTransaction
);

module.exports = router;
