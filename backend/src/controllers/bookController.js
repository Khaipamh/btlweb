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
            whereClause['$Genre.genre_name$'] = { [Op.like]: `%${category}%` };
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
        const { id } = req.params;
        let book;

        // Kiểm tra xem ID là số (PK) hay Slug
        if (/^\d+$/.test(id)) {
            book = await Book.findByPk(id, { 
                include: [Author, Genre, BookImage, Publisher] 
            });
        } else {
            book = await Book.findOne({ 
                where: { book_slug: id },
                include: [Author, Genre, BookImage, Publisher] 
            });
        }
        
        if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        console.error("Lỗi getBookDetail:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Tạo sách mới
const createBook = async (req, res) => {
    try {
        const newBook = await Book.create(req.body);
        const bookDir = path.join(uploadRoot, 'books', String(newBook.book_id));

        // Xử lý Tải lên tệp (req.files)
        if (req.files && req.files.length > 0) {
            if (!fs.existsSync(bookDir)) {
                fs.mkdirSync(bookDir, { recursive: true });
            }

            for (const file of req.files) {
                const oldPath = file.path;
                const newPath = path.join(bookDir, file.filename);
                
                fs.renameSync(oldPath, newPath);

                const imageUrl = `/uploads/books/${newBook.book_id}/${file.filename}`;
                await BookImage.create({
                    book_id: newBook.book_id,
                    book_image_url: imageUrl
                });
            }
        } 
        
        // Xử lý Ảnh URL
        if (req.body.images) {
            const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            for (const url of images) {
                await BookImage.create({
                    book_id: newBook.book_id,
                    book_image_url: url
                });
            }
        }
        
        res.status(201).json({ success: true, data: newBook });
    } catch (error) {
        console.error("Lỗi createBook:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Cập nhật sách
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Book.update(req.body, { where: { book_id: id } });

        // Xử lý Hình ảnh
        if (req.body.images || (req.files && req.files.length > 0)) {
            const bookDir = path.join(uploadRoot, 'books', String(id));

            let finalImages = [];
            if (req.body.images) {
                finalImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            }

            if (req.files && req.files.length > 0) {
                if (!fs.existsSync(bookDir)) {
                    fs.mkdirSync(bookDir, { recursive: true });
                }
                for (const file of req.files) {
                    const oldPath = file.path;
                    const newPath = path.join(bookDir, file.filename);
                    fs.renameSync(oldPath, newPath);
                    const imageUrl = `/uploads/books/${id}/${file.filename}`;
                    finalImages.push(imageUrl);
                }
            }

            // Đồng bộ Cơ sở dữ liệu: Xóa ảnh bị gỡ, thêm ảnh mới
            const currentImages = await BookImage.findAll({ where: { book_id: id } });
            const currentUrls = currentImages.map(img => img.book_image_url);

            const imagesToDelete = currentImages.filter(img => !finalImages.includes(img.book_image_url));
            for (const img of imagesToDelete) {
                await img.destroy();
            }

            const imagesToAdd = finalImages.filter(url => !currentUrls.includes(url));
            for (const url of imagesToAdd) {
                await BookImage.create({
                    book_id: id,
                    book_image_url: url
                });
            }
        }
        
        const updated = await Book.findByPk(id, { include: [Author, Genre, BookImage, Publisher] });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updated });
    } catch (error) {
        console.error("Lỗi updateBook:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa sách
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await BookImage.destroy({ where: { book_id: id } });
        const deleted = await Book.destroy({ where: { book_id: id } });

        if (deleted) return res.status(200).json({ success: true, message: 'Đã xóa sách' });
        return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// --- CÁC GETTER METADATA ---
const getGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();
        res.status(200).json({ success: true, data: genres });
    } catch (e) { res.status(500).json({ error: e.message }) }
};
const getAuthors = async (req, res) => {
    try {
        const authors = await Author.findAll();
        res.status(200).json({ success: true, data: authors });
    } catch (e) { res.status(500).json({ error: e.message }) }
};
const getPublishers = async (req, res) => {
    try {
        const pub = await Publisher.findAll();
        res.status(200).json({ success: true, data: pub });
    } catch (e) { res.status(500).json({ error: e.message }) }
};

// --- QUẢN LÝ TÁC GIẢ ---
const createAuthor = async (req, res) => {
    try {
        const newAuthor = await Author.create(req.body);
        res.status(201).json({ success: true, data: newAuthor });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const updateAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        await Author.update(req.body, { where: { author_id: id } });
        res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await Book.count({ where: { author_id: id } });
        if (count > 0) return res.status(400).json({ success: false, message: 'Không thể xóa: Tác giả có sách liên kết' });
        await Author.destroy({ where: { author_id: id } });
        res.status(200).json({ success: true, message: 'Đã xóa tác giả' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// --- QUẢN LÝ THỂ LOẠI ---
const createGenre = async (req, res) => {
    try {
        const newGenre = await Genre.create(req.body);
        res.status(201).json({ success: true, data: newGenre });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        await Genre.update(req.body, { where: { genre_id: id } });
        res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await Book.count({ where: { genre_id: id } });
        if (count > 0) return res.status(400).json({ success: false, message: 'Không thể xóa: Thể loại có sách liên kết' });
        await Genre.destroy({ where: { genre_id: id } });
        res.status(200).json({ success: true, message: 'Đã xóa thể loại' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// --- QUẢN LÝ KHO ---
const importStock = async (req, res) => {
    try {
        const { book_id, quantity } = req.body;
        const book = await Book.findByPk(book_id);
        if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });

        const newStock = parseInt(book.stock_quantity) + parseInt(quantity);
        await book.update({ stock_quantity: newStock });

        res.status(200).json({ success: true, message: `Đã nhập ${quantity}. Tồn kho mới: ${newStock}`, data: book });
    } catch (error) { 
        console.error("Lỗi importStock:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' }); 
    }
};

// Lấy sách Flash Sale (với logic giảm giá giả)
const getFlashSaleBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            limit: 10,
            order: [['book_id', 'DESC']], 
            include: [{ model: BookImage, attributes: ['book_image_url'] }]
        });

        const flashSaleData = books.map(book => {
            const dbPrice = Number(book.price);
            // Tăng giá giả để hiển thị giảm giá
            const fakeOldPrice = Math.round((dbPrice * 1.25) / 1000) * 1000;
            
            let imageUrl = 'https://placehold.co/400x600?text=No+Image';
            const images = book.BookImages || book.book_images;
            if (images && images.length > 0) {
                 imageUrl = images[0].book_image_url;
            }

            return {
                id: book.book_id,
                slug: book.book_slug, 
                title: book.book_title,
                price: dbPrice,        
                oldPrice: fakeOldPrice, 
                discount: 25,          
                image: imageUrl,
                sold: Math.floor(Math.random() * 20) + 5, 
                totalStock: book.stock_quantity || 50
            };
        });

        res.status(200).json({ success: true, data: flashSaleData });
    } catch (error) {
        console.error("Lỗi getFlashSaleBooks:", error);
        res.status(500).json({ success: false });
    }
};

module.exports = { 
    getAllBooks, getBookDetail, createBook, updateBook, deleteBook, 
    getGenres, getAuthors, getPublishers,
    createAuthor, updateAuthor, deleteAuthor,
    createGenre, updateGenre, deleteGenre,
    importStock, getFlashSaleBooks
};