const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Quản lý bài đăng blog và tin tức
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lấy tất cả bài viết
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, all]
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *   post:
 *     summary: Tạo bài viết mới (Quản trị viên/Nhân viên)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - post_slug
 *             properties:
 *               title:
 *                 type: string
 *               post_slug:
 *                 type: string
 *               thumbnail_url:
 *                 type: string
 *               content:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Bài viết được tạo thành công
 *       403:
 *         description: Bị cấm
 */
router.get('/', postController.getAllPosts);
router.post('/', verifyToken, authorize(['admin', 'employee']), postController.createPost);

/**
 * @swagger
 * /api/posts/categories:
 *   get:
 *     summary: Lấy tất cả danh mục bài viết
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/categories', postController.getPostCategories);

/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Lấy chi tiết bài viết theo slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get('/slug/:slug', postController.getPostBySlug);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết bài viết
 *   put:
 *     summary: Cập nhật bài viết (Quản trị viên/Nhân viên)
 *     tags: [Posts]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa bài viết (Quản trị viên/Nhân viên)
 *     tags: [Posts]
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
router.get('/:id', postController.getPostDetail);
router.put('/:id', verifyToken, authorize(['admin', 'employee']), postController.updatePost);
router.delete('/:id', verifyToken, authorize(['admin', 'employee']), postController.deletePost);

module.exports = router;
