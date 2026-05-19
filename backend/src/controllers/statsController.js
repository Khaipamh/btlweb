const { models } = require('../config/database');
const { Order, User, Book, Author, Publisher, Post } = models;
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Lấy thống kê bảng điều khiển
const getDashboardStats = async (req, res) => {
    try {
        const { period } = req.query; // 'week', 'month', 'year'
        
        const now = new Date();
        let startDate;

        if (period === 'week') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
        } else if (period === 'year') {
             startDate = new Date();
             startDate.setMonth(now.getMonth() - 11);
        } else {
             // Mặc định: Tháng (30 ngày)
             startDate = new Date();
             startDate.setDate(now.getDate() - 29);
        }

        startDate.setHours(0, 0, 0, 0);

        // Thống kê Doanh thu & Đơn hàng
        const revenueStats = await Order.findAll({
            where: {
                created_at: { [Op.gte]: startDate },
                order_status: 'delivered',
                payment_status: 'paid'
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('final_amount')), 'totalRevenue'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'totalOrders']
            ],
            raw: true
        });

        const periodRevenue = revenueStats[0].totalRevenue || 0;
        const periodOrders = revenueStats[0].totalOrders || 0;

        // Tổng quan Hệ thống (Toàn thời gian)
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalBooks = await Book.sum('stock_quantity') || 0; 
        const totalTitles = await Book.count();
        const totalAuthors = await Author.count();
        const totalPublishers = await Publisher.count();
        const totalPosts = await Post.count();

        // Dữ liệu Biểu đồ
        const ordersForChart = await Order.findAll({
            where: {
                created_at: { [Op.gte]: startDate },
                order_status: 'delivered',
                payment_status: 'paid'
            },
            attributes: ['created_at', 'final_amount'],
            order: [['created_at', 'ASC']]
        });

        const grouped = {};
        
        if (period === 'year') {
             for (let i = 0; i < 12; i++) {
                 const d = new Date(startDate);
                 d.setMonth(startDate.getMonth() + i);
                 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                 grouped[key] = 0;
             }
        } else {
             const diffTime = Math.abs(now - startDate);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             for (let i = 0; i <= diffDays; i++) {
                 const d = new Date(startDate);
                 d.setDate(startDate.getDate() + i);
                 const key = d.toISOString().split('T')[0];
                 grouped[key] = 0;
             }
        }

        ordersForChart.forEach(order => {
            const date = new Date(order.created_at);
            let key;
            if (period === 'year') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.toISOString().split('T')[0];
            }

            if (grouped[key] !== undefined) {
                grouped[key] += parseFloat(order.final_amount);
            }
        });

        const chartData = Object.keys(grouped).map(key => ({
            label: key,
            value: grouped[key]
        }));

        res.status(200).json({
            success: true,
            data: {
                periodRevenue,
                periodOrders,
                totalUsers,
                totalBooks,
                totalTitles,
                totalAuthors,
                totalPublishers,
                totalPosts,
                chartData
            }
        });

    } catch (error) {
        console.error("Lỗi Thống kê:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { getDashboardStats };
