const { models } = require('../config/database');
const { Post, Category } = models;

// Lấy tất cả bài viết
const getAllPosts = async (req, res) => {
    try {
        const { status } = req.query;

        let whereClause = { status: 'published' };

        // Logic lọc cho Dashboard Admin
        if (status === 'all') {
            whereClause = {};
        } else if (status) {
            whereClause = { status };
        }

        const posts = await Post.findAll({
            where: whereClause,
            include: [{ model: Category, attributes: ['category_name'] }],
            order: [['post_id', 'DESC']]
        });
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Lấy chi tiết bài viết theo ID
const getPostDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [Category]
        });

        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Lấy chi tiết bài viết theo slug
const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({
            where: { post_slug: slug, status: 'published' },
            include: [Category]
        });

        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Lấy danh mục bài viết
const getPostCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Tạo bài viết mới
const createPost = async (req, res) => {
    try {
        const { title, post_slug, thumbnail_url, content, category_id, status } = req.body;
        
        if (!title || !post_slug) {
            return res.status(400).json({ success: false, message: 'Tiêu đề và Slug là bắt buộc' });
        }

        const newPost = await Post.create({
            title,
            post_slug,
            thumbnail_url,
            content,
            category_id,
            status: status || 'draft',
            user_id: req.user_id
        });

        res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Slug bài viết đã tồn tại' });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Cập nhật bài viết
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, post_slug, thumbnail_url, content, category_id, status } = req.body;

        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });

        await post.update({
            title,
            post_slug,
            thumbnail_url,
            content,
            category_id,
            status
        });

        res.json({ success: true, message: 'Cập nhật bài viết thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Xóa bài viết
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Post.destroy({ where: { post_id: id } });
        
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });

        res.json({ success: true, message: 'Xóa bài viết thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { 
    getAllPosts, 
    getPostDetail, 
    getPostBySlug,
    getPostCategories, 
    createPost, 
    updatePost, 
    deletePost 
};
