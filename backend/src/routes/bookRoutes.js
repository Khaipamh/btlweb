const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { upload } = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Quản lý sách
 */

// --- CÁC ROUTE LẤY DỮ LIỆU (GET) ---

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Lấy tất cả sách (với bộ lọc và phân trang)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số mục mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo tên danh mục
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Trường sắp xếp (ví dụ: price)"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách sách với metadata
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/genres:
 *   get:
 *     summary: Lấy tất cả thể loại
 *     tags: [Books - Metadata]
 *     responses:
 *       200:
 *         description: Danh sách thể loại
 */
router.get('/genres', bookController.getGenres);

/**
 * @swagger
 * /api/books/publishers:
 *   get:
 *     summary: Lấy tất cả nhà xuất bản
 *     tags: [Books - Metadata]
 *     responses:
 *       200:
 *         description: Danh sách nhà xuất bản
 */
router.get('/publishers', bookController.getPublishers);

/**
 * @swagger
 * /api/books/authors:
 *   get:
 *     summary: Lấy tất cả tác giả
 *     tags: [Books - Metadata]
 *     responses:
 *       200:
 *         description: Danh sách tác giả
 */
router.get('/authors', bookController.getAuthors);

/**
 * @swagger
 * /api/books/flash-sale:
 *   get:
 *     summary: Lấy sách Flash Sale
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Danh sách sách flash sale với thông tin giảm giá
 */
router.get('/flash-sale', bookController.getFlashSaleBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Lấy chi tiết sách theo ID hoặc Slug
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID sách (số) hoặc Slug sách (chuỗi)
 *     responses:
 *       200:
 *         description: Chi tiết sách
 *       404:
 *         description: Không tìm thấy sách
 */
router.get('/:id', bookController.getBookDetail);

// --- CÁC ROUTE QUẢN TRỊ (THÊM / SỬA / XÓA) ---

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Tạo sách mới (Hỗ trợ tải lên nhiều ảnh)
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               book_title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               author_id:
 *                 type: integer
 *               genre_id:
 *                 type: integer
 *               publisher_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Danh sách tệp ảnh
 *     responses:
 *       201:
 *         description: Tạo sách thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', upload.array('images', 10), bookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Cập nhật sách
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               book_title:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Tệp ảnh mới để tải lên
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sách
 */
router.put('/:id', upload.array('images', 10), bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Xóa sách
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', bookController.deleteBook);

// --- CÁC ROUTE TÁC GIẢ ---

/**
 * @swagger
 * /api/books/authors:
 *   post:
 *     summary: Tạo tác giả mới
 *     tags: [Books - Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author_name
 *             properties:
 *               author_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/authors', bookController.createAuthor);

/**
 * @swagger
 * /api/books/authors/{id}:
 *   put:
 *     summary: Cập nhật tác giả
 *     tags: [Books - Authors]
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
 *               author_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa tác giả
 *     tags: [Books - Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.put('/authors/:id', bookController.updateAuthor);
router.delete('/authors/:id', bookController.deleteAuthor);

// --- CÁC ROUTE THỂ LOẠI ---

/**
 * @swagger
 * /api/books/genres:
 *   post:
 *     summary: Tạo thể loại mới
 *     tags: [Books - Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - genre_name
 *             properties:
 *               genre_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/genres', bookController.createGenre);

/**
 * @swagger
 * /api/books/genres/{id}:
 *   put:
 *     summary: Cập nhật thể loại
 *     tags: [Books - Genres]
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
 *               genre_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa thể loại
 *     tags: [Books - Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.put('/genres/:id', bookController.updateGenre);
router.delete('/genres/:id', bookController.deleteGenre);

// --- CÁC ROUTE KHO HÀNG ---

/**
 * @swagger
 * /api/books/import:
 *   post:
 *     summary: Nhập kho (Cộng thêm vào kho hiện có)
 *     tags: [Books - Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *               - quantity
 *             properties:
 *               book_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Nhập kho thành công
 */
router.post('/import', bookController.importStock);

module.exports = router;
