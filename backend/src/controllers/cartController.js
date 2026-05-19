const { models } = require('../config/database');
const { Cart, CartItem, Book, BookImage } = models;

// Lấy giỏ hàng của người dùng hiện tại
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { user_id: req.user_id },
            include: [
                {
                    model: CartItem,
                    include: [
                        {
                            model: Book,
                            attributes: ['book_id', 'book_title', 'price'],
                            include: [{ model: BookImage, attributes: ['book_image_url'], limit: 1 }]
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            const newCart = await Cart.create({ user_id: req.user_id });
            return res.status(200).json({ success: true, data: { ...newCart.toJSON(), CartItems: [] } });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Thêm sách vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { book_id, quantity } = req.body;
        const qty = parseInt(quantity) || 1;

        let cart = await Cart.findOne({ where: { user_id: req.user_id } });
        if (!cart) {
            cart = await Cart.create({ user_id: req.user_id });
        }

        const existingItem = await CartItem.findOne({
            where: { cart_id: cart.cart_id, book_id }
        });

        if (existingItem) {
            existingItem.quantity += qty;
            await existingItem.save();
        } else {
            await CartItem.create({
                cart_id: cart.cart_id,
                book_id,
                quantity: qty
            });
        }

        res.status(200).json({ success: true, message: 'Đã thêm vào giỏ' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params; // cart_item_id
        await CartItem.destroy({ where: { cart_item_id: id } });
        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Cập nhật số lượng sản phẩm
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params; // cart_item_id
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
        }

        const item = await CartItem.findOne({ where: { cart_item_id: id } });
        
        if (!item) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        item.quantity = quantity;
        await item.save();

        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Xóa tất cả sản phẩm trong giỏ
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { user_id: req.user_id } });
        
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.cart_id } });
        }

        res.status(200).json({ success: true, message: 'Đã xóa giỏ hàng' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { getCart, addToCart, removeCartItem, updateCartItem, clearCart };