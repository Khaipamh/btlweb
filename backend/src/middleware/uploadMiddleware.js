const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đường dẫn tạm để lưu file vừa tải lên (chưa gắn vào sách)
const uploadRoot = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');
const tempDir = path.join(uploadRoot, 'temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        // Tên file: timestamp-tên_gốc (giữ nguyên tên gốc để dễ tìm)
        // Xóa dấu tiếng Việt và ký tự lạ trong tên file
        const sanitizedName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '_');
            
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

// Bộ lọc file
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên file ảnh (jpeg, jpg, png, gif, webp)!'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB
    fileFilter: fileFilter
});

module.exports = { upload, uploadRoot, tempDir };
