const { models, sequelize } = require('../config/database');
const { Order, OrderItem, Cart, CartItem, Book, Address, Voucher, User, Transaction } = models;
const { BaseOrderPrice, VoucherDecorator, ShippingFeeDecorator } = require('../patterns/PricingDecorators');

const normalizePaymentMethod = (m) => String(m || '').trim().toLowerCase();

// Tạo Đơn hàng từ Giỏ hàng
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      payment_method,
      voucher_code,
      address_id,
      recipient_name,
      phone,
      address_detail
    } = req.body;

    const user_id = req.user_id;
    let finalAddressId = address_id;

    // 1. Xử lý Địa chỉ
    if (!finalAddressId) {
      if (!recipient_name || !phone || !address_detail) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Yêu cầu địa chỉ giao hàng' });
      }

      const newAddress = await Address.create({
        user_id,
        recipient_name,
        phone,
        address_detail,
        is_default: false
      }, { transaction: t });

      finalAddressId = newAddress.address_id;
    }

    // 2. Lấy Giỏ hàng
    const cart = await Cart.findOne({
      where: { user_id },
      include: [{ model: CartItem, include: [Book] }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    // 3. Kiểm tra Tồn kho
    for (const item of cart.CartItems) {
      if (item.Book.stock_quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Sách "${item.Book.book_title}" đã hết hàng (Còn lại: ${item.Book.stock_quantity})`
        });
      }
    }

    // 4. Tính Giá
    let priceCalculator = new BaseOrderPrice(cart.CartItems);

    let voucher = null;
    if (voucher_code) {
      voucher = await Voucher.findOne({ where: { code: voucher_code } });
      if (voucher) priceCalculator = new VoucherDecorator(priceCalculator, voucher);
    }

    priceCalculator = new ShippingFeeDecorator(priceCalculator, 30000);
    const finalAmount = await priceCalculator.calculate();

    const baseCalc = new BaseOrderPrice(cart.CartItems);
    const totalAmount = await baseCalc.calculate();

    // 5. Tạo Đơn hàng
    const newOrder = await Order.create({
      user_id,
      shipping_address: finalAddressId,
      total_amount: totalAmount,
      final_amount: finalAmount,
      voucher_id: voucher ? voucher.voucher_id : null,
      payment_status: 'unpaid',
      order_status: 'pending'
    }, { transaction: t });

    // 6. Tạo Giao dịch (Đang chờ xử lý)
    const pm = normalizePaymentMethod(payment_method);
    const isBankTransfer = ['bank_transfer', 'bank-transfer', 'transfer', 'sepay', 'bank', 'qr', 'vnpay_bank', 'online'].includes(pm);
    const isCOD = ['cod', 'cash', 'tien_mat'].includes(pm);

    if (isBankTransfer || isCOD) {
      await Transaction.create({
        order_id: newOrder.order_id,
        user_id: user_id,
        amount: finalAmount,
        payment_method: isCOD ? 'COD' : 'bank_transfer', 
        status: 'pending' 
      }, { transaction: t });
    }

    // 7. Tạo Chi tiết đơn hàng & Cập nhật Tồn kho
    for (const item of cart.CartItems) {
      await OrderItem.create({
        order_id: newOrder.order_id,
        book_id: item.book_id,
        quantity: item.quantity,
        unit_price: item.Book.price,
        subtotal: item.quantity * item.Book.price
      }, { transaction: t });

      await Book.decrement('stock_quantity', {
        by: item.quantity,
        where: { book_id: item.book_id },
        transaction: t
      });

      await Book.increment('total_sold', {
        by: item.quantity,
        where: { book_id: item.book_id },
        transaction: t
      });
    }

    // 8. Xóa Giỏ hàng
    await CartItem.destroy({
      where: { cart_id: cart.cart_id },
      transaction: t
    });

    await t.commit();

    // 9. Tạo Thông tin Thanh toán (nếu có)
    let paymentInfo = null;
    try {
      const { PaymentFactory } = require('../patterns/PaymentFactory');
      const factory = PaymentFactory.getFactory(payment_method, models, sequelize);
      if (factory) {
        const processor = factory.createProcessor();
        paymentInfo = processor.generatePaymentInfo(newOrder);
      }
    } catch (err) {
      console.error("Lỗi Payment Factory:", err);
    }

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công!',
      order_id: newOrder.order_id,
      final_amount: finalAmount,
      payment_info: paymentInfo
    });

  } catch (error) {
    await t.rollback();
    console.error("Lỗi Đơn hàng:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ trong quá trình thanh toán' });
  }
};

// Lấy đơn hàng của người dùng hiện tại
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const limitInt = parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where: { user_id: req.user_id },
      order: [['created_at', 'DESC']],
      include: [
        { model: OrderItem, include: [{ model: Book, attributes: ['book_title'] }] },
        { model: Transaction, attributes: ['transaction_id', 'status', 'payment_method'] },
        { model: Address, attributes: ['address_detail', 'recipient_name', 'phone'] }
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
    console.error("Lỗi getMyOrders:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Lấy tất cả đơn hàng (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    const limitInt = parseInt(limit);

    let whereClause = {};
    let userWhereClause = {};

    if (search) {
        const searchNum = parseInt(search);
        if (!isNaN(searchNum)) {
             whereClause.order_id = searchNum;
        } else {
             const { Op } = require('sequelize');
             userWhereClause = {
                [Op.or]: [
                    { full_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } }
                ]
             };
        }
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      order: [['order_id', 'ASC']],
      include: [
        { model: OrderItem, include: [{ model: Book, attributes: ['book_title'] }] },
        { 
            model: models.User, 
            attributes: ['full_name', 'email', 'phone'],
            where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
            required: Object.keys(userWhereClause).length > 0
        },
        { model: Address, attributes: ['address_detail', 'recipient_name', 'phone'] },
        { model: Transaction, attributes: ['transaction_id', 'status', 'payment_method'] } 
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    await order.update(updateData);

    res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Tạo đơn hàng giả (Admin)
const createFakeOrder = async (req, res) => {
  try {
    let user = await User.findByPk(1);
    if (!user) user = await User.findOne();
    if (!user) return res.status(400).json({ success: false, message: 'Không tìm thấy người dùng trong DB' });

    let fakeAddress = await models.Address.findOne({ where: { user_id: user.user_id } });
    if (!fakeAddress) {
      fakeAddress = await models.Address.create({
        user_id: user.user_id,
        recipient_name: 'Khách hàng thử nghiệm',
        phone: '0999999999',
        address_detail: '1 Đường thử nghiệm',
        is_default: true
      });
    }

    const newOrder = await Order.create({
      user_id: user.user_id,
      total_amount: 500000,
      final_amount: 530000,
      shipping_address: fakeAddress.address_id,
      payment_status: 'unpaid',
      order_status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Đã tạo đơn hàng giả', data: newOrder });
  } catch (error) {
    console.error("Lỗi createFakeOrder:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};

// Xóa cứng đơn hàng (Admin)
const deleteOrderAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    await OrderItem.destroy({ where: { order_id: id }, transaction: t });
    await Transaction.destroy({ where: { order_id: id }, transaction: t });
    await Order.destroy({ where: { order_id: id }, transaction: t });

    await t.commit();
    return res.status(200).json({ success: true, message: 'Đã xóa đơn hàng' });
  } catch (error) {
    await t.rollback();
    console.error('Lỗi deleteOrderAdmin:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  createOrder, getMyOrders, getAllOrders, updateOrderStatus,
  createFakeOrder,
  deleteOrderAdmin
};