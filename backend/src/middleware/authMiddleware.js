const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Lấy token từ header: "Authorization: Bearer <token>"
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không tìm thấy token, vui lòng đăng nhập!' });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sahafa_secret_key');
        req.user_id = decoded.user_id; // Lưu user_id vào request để dùng ở controller sau
        req.user_role = decoded.role;
        next(); // Cho phép đi tiếp
    } catch (error) {
        console.log(error);
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Middleware phân quyền
const authorize = (roles = []) => {
    // tham số roles có thể là chuỗi (1 vai trò) hoặc mảng (nhiều vai trò)
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user_role) {
            return res.status(401).json({ success: false, message: 'Chưa xác thực danh tính' });
        }

        if (roles.length && !roles.includes(req.user_role)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }

        next();
    };
};

module.exports = { verifyToken, authorize };
