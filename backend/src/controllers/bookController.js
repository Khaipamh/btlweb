const { models } = require('../config/database'); 

if (!models || !models.Book) {
    console.error("Lỗi Nghiêm trọng: Không tìm thấy Models trong cấu hình cơ sở dữ liệu");
}

const { Book, Author, Genre, BookImage, Publisher } = models; 
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { uploadRoot } = require('../middleware/uploadMiddleware');

// Lấy tất cả sách với bộ lọc và phân trang
const getAllBooks = async (req, res) => {
    try {
        const { sort, order, limit, page, category, search } = req.query; 
        
        // Giá trị mặc định
        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 10;
        const offset = (pageInt - 1) * limitInt;

        let whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { book_title: { [Op.like]: `%${search}%` } }
            ];
        }

        if (category) {
            whereClause['$Genre.genre_slug$'] = { [Op.like]: `%${category}%` };
        }

        const { count, rows } = await Book.findAndCountAll({
            where: whereClause,
            order: sort ? [[sort, order || 'DESC']] : [['book_id', 'DESC']],
            limit: limitInt,
            offset: offset,
            include: [
                { model: Author, attributes: ['author_name'] },
                { model: Genre, attributes: ['genre_name', 'genre_slug'] },
                { model: BookImage, attributes: ['book_image_url'] }
            ],
            distinct: true
        });

        const formattedData = rows.map(b => ({
            book_id: b.book_id,
            book_slug: b.book_slug,
            book_title: b.book_title,
            description: b.description || '',
            price: Number(b.price),
            stock_quantity: b.stock_quantity || 0,
            isbn: b.isbn || null,
            total_sold: b.total_sold || 0,
            BookImages: b.BookImages || [],
            Author: b.Author || null,
            Genre: b.Genre || null
        }));

        res.status(200).json({ 
            success: true, 
            data: formattedData,
            meta: {
                total: count,
                page: pageInt,
                limit: limitInt,
                totalPages: Math.ceil(count / limitInt)
            }
        });
    } catch (error) {
        console.error("Lỗi getAllBooks:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Lấy chi tiết sách theo ID hoặc Slug
const getBookDetail = async (req, res) => {
    try {