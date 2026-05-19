const { Sequelize } = require("sequelize");
require("dotenv").config();
const path = require("path");

// 1. Khởi tạo Sequelize
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || './sahafa.sqlite',
    logging: false, // Tắt log query cho gọn
});

// 2. Import hàm initModels
// Sử dụng path.join để đảm bảo đường dẫn đúng trên mọi hệ điều hành
const modelsPath = path.join(__dirname, "../models/models"); 
console.log("📂 Đang tìm file models tại:", modelsPath);

let initModels;
try {
    initModels = require(modelsPath);
} catch (error) {
    console.error("❌ LỖI: Không tìm thấy file models.js tại đường dẫn trên!");
    console.error(error);
    process.exit(1);
}

// 3. Gọi hàm initModels
console.log("🛠️ Đang chạy initModels...");
const models = initModels(sequelize);

// 4. Kiểm tra kỹ xem models có dữ liệu không
if (!models || Object.keys(models).length === 0) {
    console.error("❌ LỖI: Hàm initModels trả về rỗng! Kiểm tra file models.js xem có dòng 'return' chưa.");
    process.exit(1);
} else {
    console.log(`✅ Đã tải thành công ${Object.keys(models).length} models:`, Object.keys(models).join(", "));
}

// 5. Hàm kết nối
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối Cơ sở dữ liệu thành công!");
        await sequelize.sync(); // Đồng bộ bảng
        console.log("✅ Đã đồng bộ cấu trúc Cơ sở dữ liệu!");
    } catch (error) {
        console.error("❌ Kết nối thất bại:", error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB, models };
