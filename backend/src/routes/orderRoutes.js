const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới (Thanh toán)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method
 *             properties:
 *               payment_method:
 *                 type: string
 *                 description: 'COD hoặc bank_transfer'
 *               voucher_code:
 *                 type: string
 *               address_id:
 *                 type: integer
 *                 description: ID của địa chỉ hiện có (tùy chọn nếu cung cấp chi tiết)
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_detail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đơn hàng được tạo thành công
 *       400:
 *         description: Lỗi xác thực hoặc Hết hàng
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của người dùng hiện tại
 *     tags: [Orders]
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
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/my-orders', orderController.getMyOrders);

// --- CÁC ROUTE QUẢN TRỊ ---

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Lấy tất cả đơn hàng (Quản trị viên/Nhân viên)
 *     tags: [Orders Management]
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
 *         description: Tìm kiếm theo ID Đơn hàng, Tên người dùng, Email hoặc Số điện thoại
 *     responses:
 *       200:
 *         description: Danh sách tất cả đơn hàng
 */
router.get('/admin', authorize(['admin', 'employee']), orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/admin/fake:
 *   post:
 *     summary: Tạo đơn hàng giả để thử nghiệm (Quản trị viên/Nhân viên)
 *     tags: [Orders Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Đơn hàng giả đã được tạo
 */
router.post('/admin/fake', authorize(['admin', 'employee']), orderController.createFakeOrder);

/**
 * @swagger
 * /api/orders/admin/{id}:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Quản trị viên/Nhân viên)
 *     tags: [Orders Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_status:
 *                 type: string
 *                 enum: [pending, processing, shipping, delivered, cancelled]
 *               payment_status:
 *                 type: string
 *                 enum: [unpaid, paid, refunded]
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái
 *   delete:
 *     summary: Xóa cứng đơn hàng (Quản trị viên/Nhân viên)
 *     tags: [Orders Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Đã xóa đơn hàng
 */
router.put('/admin/:id', authorize(['admin', 'employee']), orderController.updateOrderStatus);
router.delete('/admin/:id', authorize(['admin', 'employee']), orderController.deleteOrderAdmin);

module.exports = router;