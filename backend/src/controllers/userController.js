const { models } = require('../config/database');
const { User, Address, Cart } = models;
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// --- USER PROFILE ---

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user_id, {
            attributes: { exclude: ['password', 'deleted_at'] }
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update current user profile
const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, avatar_url } = req.body;
        
        // Check for duplicate phone number
        if (phone) {
             const exists = await User.findOne({ 
                 where: { 
                     phone, 
                     user_id: { [Op.ne]: req.user_id }
                 } 
             });
             if (exists) return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng' });
        }

        await User.update(
            { full_name, phone, avatar_url },
            { where: { user_id: req.user_id } }
        );

        res.json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- ADDRESS MANAGEMENT ---

// Get all addresses
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { user_id: req.user_id },
            order: [['is_default', 'DESC']]
        });
        res.json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add new address
const addAddress = async (req, res) => {
    try {
        const { address_detail, phone, recipient_name, is_default } = req.body;

        if (!address_detail || !recipient_name || !phone) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
        }

        // If setting default, unset previous default
        if (is_default) {
            await Address.update({ is_default: false }, { where: { user_id: req.user_id } });
        }

        // Default if first address
        const count = await Address.count({ where: { user_id: req.user_id } });
        const shouldDefault = count === 0 ? true : is_default;

        const newAddress = await Address.create({
            user_id: req.user_id,
            address_detail,
            phone,
            recipient_name,
            is_default: shouldDefault || false
        });

        res.status(201).json({ success: true, data: newAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { address_detail, phone, recipient_name, is_default } = req.body;

        const address = await Address.findOne({ where: { address_id: id, user_id: req.user_id } });
        if (!address) return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại' });

        if (is_default) {
            await Address.update({ is_default: false }, { where: { user_id: req.user_id } });
        }

        await address.update({ 
            address_detail, phone, recipient_name, 
            is_default: is_default !== undefined ? is_default : address.is_default 
        });
        
        res.json({ success: true, message: 'Cập nhật địa chỉ thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Address.destroy({ where: { address_id: id, user_id: req.user_id } });
        
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ hoặc không có quyền xóa' });
        
        res.json({ success: true, message: 'Xóa địa chỉ thành công' });
    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- ADMIN MANAGEMENT ---

// Get all users (Admin/Employee)
const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (role) whereClause.role = role;
        if (search) {
            whereClause[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (req.user_role === 'employee' && (!role || role !== 'customer')) {
             whereClause.role = 'customer';
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create User (Admin only)
const createUser = async (req, res) => {
    try {
        const { full_name, email, password, role, phone } = req.body;
        
        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name,
            email,
            password: hashPassword,
            role: role || 'customer',
            phone
        });

        // Create default Cart
        await Cart.create({ user_id: newUser.user_id });

        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update User (Admin only)
const updateUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role, phone, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'admin' && user.user_id !== req.user_id) {
             return res.status(403).json({ success: false, message: 'Không thể chỉnh sửa Admin khác' });
        }

        const updateData = { full_name, role, phone };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete User (Admin only)
const deleteUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản Admin' });
        }

        await user.destroy();
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { 
    getProfile, 
    updateProfile, 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress,
    getAllUsers,
    createUser,
    updateUserAdmin,
    deleteUserAdmin
};
