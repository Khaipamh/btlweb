const { models, sequelize } = require('../config/database');
const { Order, Transaction, User, Address } = models;
const { SePayFactory } = require('../patterns/PaymentFactory');

// Xử lý Webhook SePay
const handleSepayWebhook = async (req, res) => {
  try {
    const paymentFactory = new SePayFactory(models, sequelize);
    const webhookHandler = paymentFactory.createWebhookHandler();
    const result = await webhookHandler.process(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi Webhook:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Lấy tất cả giao dịch
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    const limitInt = parseInt(limit);

    let whereClause = {};
    let userWhereClause = {};

    if (search) {
        const searchNum = parseInt(search);
        if (!isNaN(searchNum)) {
             whereClause = {
                [require('sequelize').Op.or]: [
                    { transaction_id: searchNum },
                    { order_id: searchNum }
                ]
             };
        } else {
             const { Op } = require('sequelize');
             userWhereClause = {
                [Op.or]: [
                    { full_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
             };
        }
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: [
        { 
            model: User, 
            attributes: ['full_name', 'email'],
            where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
            required: Object.keys(userWhereClause).length > 0 
        },
        { model: Order, attributes: ['total_amount', 'final_amount', 'payment_status', 'order_status'] }
      ],
      limit: limitInt,
      offset: offset,
      distinct: true
    });

    res.status(200).json({ 
        success: true, 
        data: rows,
        meta: {
            total: count,
            page: parseInt(page),
            limit: limitInt,
            totalPages: Math.ceil(count / limitInt)
        }
    });
  } catch (error) {
    console.error('Lỗi getAllTransactions:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Phê duyệt giao dịch thủ công
const approveTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    if (transaction.status === 'success') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Giao dịch đã thành công rồi' });
    }

    const order = await Order.findByPk(transaction.order_id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng liên quan' });
    }

    await transaction.update({ status: 'success' }, { transaction: t });

    await order.update({
      payment_status: 'paid',
      order_status: 'processing'
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Giao dịch đã được phê duyệt thủ công' });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Xóa giao dịch
const deleteTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const tx = await Transaction.findByPk(id);
    if (!tx) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    if (tx.status === 'success') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Không thể xóa giao dịch thành công' });
    }

    await Transaction.destroy({ where: { transaction_id: id }, transaction: t });
    await t.commit();
    res.json({ success: true, message: 'Giao dịch đã bị xóa' });
  } catch (error) {
    await t.rollback();
    console.error('Lỗi deleteTransaction:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Tạo giao dịch giả
const createFakeTransaction = async (req, res) => {
  try {
    const adminId = req.user_id || 1;
    let user = await User.findByPk(adminId);
    if (!user) user = await User.findOne();

    if (!user) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy người dùng trong DB' });
    }

    let addr = await Address.findOne({ where: { user_id: user.user_id } });
    if (!addr) {
      addr = await Address.create({
        user_id: user.user_id,
        recipient_name: 'Khách hàng thử nghiệm',
        phone: '0900000000',
        address_detail: 'Địa chỉ thử nghiệm',
        is_default: false
      });
    }

    const order = await Order.create({
      user_id: user.user_id,
      shipping_address: addr.address_id,
      total_amount: 100000,
      final_amount: 130000,
      payment_status: 'unpaid',
      order_status: 'pending'
    });

    const tx = await Transaction.create({
      order_id: order.order_id,
      user_id: user.user_id,
      amount: order.final_amount || order.total_amount,
      payment_method: 'bank_transfer',
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Đã tạo giao dịch giả', data: tx });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  handleSepayWebhook,
  getAllTransactions,
  approveTransaction,
  deleteTransaction,
  createFakeTransaction
};
