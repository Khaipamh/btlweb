const { models } = require('../config/database');
const { Voucher } = models;
const { Op } = require('sequelize');

// Get valid vouchers
const getVouchers = async (req, res) => {
    try {
        const now = new Date();
        const vouchers = await Voucher.findAll({
            where: {
                start_at: { [Op.lte]: now },
                end_at: { [Op.gte]: now }, 
                usage_limit: { [Op.gt]: 0 } 
            }
        });
        res.json({ success: true, data: vouchers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Check voucher validity
const checkVoucher = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        const now = new Date();

        const voucher = await Voucher.findOne({
            where: { 
                code,
                start_at: { [Op.lte]: now },
                end_at: { [Op.gte]: now }
            }
        });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found or expired' });
        }

        if (voucher.usage_limit <= 0) {
            return res.status(400).json({ success: false, message: 'Voucher usage limit exceeded' });
        }

        if (orderValue && voucher.min_order_value && orderValue < parseFloat(voucher.min_order_value)) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order value required: ${voucher.min_order_value}` 
            });
        }

        res.json({ success: true, data: voucher, message: 'Valid voucher' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create voucher (Admin)
const createVoucher = async (req, res) => {
    try {
        const { code, discount_type, value, min_order_value, usage_limit, start_at, end_at } = req.body;

        const newVoucher = await Voucher.create({
            code,
            discount_type: discount_type || 'fixed',
            value,
            min_order_value,
            usage_limit,
            start_at,
            end_at
        });

        res.status(201).json({ success: true, data: newVoucher });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Voucher code already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { usage_limit, start_at, end_at, min_order_value } = req.body;

        const voucher = await Voucher.findByPk(id);
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

        await voucher.update({
            usage_limit,
            start_at,
            end_at,
            min_order_value
        });

        res.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete voucher
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Voucher.destroy({ where: { voucher_id: id } });
        
        if (!deleted) return res.status(404).json({ success: false, message: 'Voucher not found' });

        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all vouchers (Admin)
const getAllVouchersAdmin = async (req, res) => {
    try {
        const vouchers = await Voucher.findAll({
            order: [['voucher_id', 'DESC']] 
        });
        res.json({ success: true, data: vouchers });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { 
    getVouchers, checkVoucher, createVoucher, updateVoucher, deleteVoucher,
    getAllVouchersAdmin
 };