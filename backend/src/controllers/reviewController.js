const { models } = require('../config/database');
const { Review, User, Book } = models;

// Lấy đánh giá cho một cuốn sách cụ thể
const getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const reviews = await Review.findAll({
            where: { book_id: bookId },
            include: [
                { model: User, attributes: ['full_name', 'avatar_url'] }
            ],
            order: [['review_id', 'DESC']]
        });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Thêm đánh giá (yêu cầu đăng nhập)
const addReview = async (req, res) => {
    try {
        const { book_id, rating, comment } = req.body;
        
        // Xác thực đánh giá
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5' });
        }

        const newReview = await Review.create({
            user_id: req.user_id,
            book_id,
            rating,
            comment
        });

        // Cập nhật đánh giá trung bình cho sách
        const reviews = await Review.findAll({ where: { book_id } });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRating / reviews.length;

        await Book.update(
            { average_rating: avg },
            { where: { book_id } }
        );

        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { getReviewsByBook, addReview };
