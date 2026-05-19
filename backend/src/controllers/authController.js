const { models } = require('../config/database');
const { User, Cart } = models;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();

// Đăng ký người dùng mới
const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Xác thực dữ liệu
        const schema = Joi.object({
            full_name: Joi.string().min(2).max(50).required().messages({
                'string.empty': 'Tên không được để trống',
                'string.min': 'Tên phải có ít nhất 2 ký tự',
                'any.required': 'Vui lòng nhập họ tên'
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ',
                'any.required': 'Vui lòng nhập email'
            }),
            password: Joi.string()
                .min(8)
                .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
                .required()
                .messages({
                    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
                    'string.pattern.base': 'Mật khẩu phải có chữ hoa, thường, số và ký tự đặc biệt',
                    'any.required': 'Vui lòng nhập mật khẩu'
                })
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        // Kiểm tra người dùng tồn tại
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword,
            role: 'customer'
        });

        // Tạo giỏ hàng trống
        await Cart.create({ user_id: newUser.user_id });

        res.status(201).json({ success: true, message: 'Đăng ký thành công!' });

    } catch (error) {
        console.error("Lỗi Đăng Ký:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Đăng nhập người dùng
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const schema = Joi.object({
            email: Joi.string().email().required().messages({ 'string.email': 'Email không hợp lệ', 'any.required': 'Vui lòng nhập email' }),
            password: Joi.string().required().messages({ 'any.required': 'Vui lòng nhập mật khẩu' })
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'sahafa_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar_url: user.avatar_url,
                address: user.address
            }
        });
    } catch (error) {
        console.error("Lỗi Đăng Nhập:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Lấy thông tin người dùng hiện tại
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user_id, { attributes: { exclude: ['password'] } });
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Cập nhật thông tin người dùng hiện tại
const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, avatar_url } = req.body;
        const user = await User.findByPk(req.user_id);
        
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        if (full_name) user.full_name = full_name;
        if (phone !== undefined) user.phone = phone;
        if (avatar_url !== undefined) user.avatar_url = avatar_url;

        await user.save();

        res.json({ 
            success: true, 
            message: 'Cập nhật thành công',
            data: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });
    } catch (error) {
        console.error("Lỗi Cập Nhật:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             const field = error.errors[0]?.path;
             if (field === 'phone') return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng' });
             if (field === 'email') return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user_id);

        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const validPass = await bcrypt.compare(oldPassword, user.password);
        if (!validPass) return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });

        if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Mật khẩu mới quá ngắn' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Quên mật khẩu
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại' });

        const newPassword = Math.random().toString(36).slice(-8) + "Aa1@";
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Mật khẩu mới', newPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, changePassword };