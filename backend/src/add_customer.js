const { sequelize } = require('./config/database');
const initModels = require('./models/models');
const bcrypt = require('bcryptjs'); 

// Lấy đủ các Model cần xử lý
const { User, Address, Cart } = initModels(sequelize);

const createLoginAccountOnly = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Giữ nguyên data khác

        const email = 'user_only@sahafa.com'; // Email bạn muốn dùng

        // --- BƯỚC 1: DỌN DẸP DỮ LIỆU CŨ (User + Địa chỉ + Giỏ hàng) ---
        const oldUser = await User.findOne({ where: { email } });
        
        if (oldUser) {
            console.log(`🧹 Tìm thấy user cũ (ID: ${oldUser.user_id}). Đang xóa...`);

            // 1. Xóa Địa chỉ cũ (Như bạn yêu cầu)
            await Address.destroy({ where: { user_id: oldUser.user_id } });
            
            // 2. Xóa Giỏ hàng cũ (Nên xóa luôn cho sạch)
            await Cart.destroy({ where: { user_id: oldUser.user_id } });

            // 3. Xóa chính User đó
            await User.destroy({ where: { user_id: oldUser.user_id } });
            
            console.log("✅ Đã xóa sạch User cũ và Địa chỉ đi kèm.");
        }
        // -----------------------------------------------------------

        // --- BƯỚC 2: TẠO USER MỚI (CHỈ LOGIN) ---
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);

        const user = await User.create({
            full_name: 'Người Dùng Test (No Address)',
            email: email,
            password: hash,
            phone: '0900000001',
            role: 'customer'
        });

        console.log("\n🎉 ĐÃ TẠO TÀI KHOẢN MỚI THÀNH CÔNG!");
        console.log("---------------------------------------");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Pass:  123456`);
        console.log(`⚠️  Lưu ý: Tài khoản này chưa có Địa chỉ.`);
        console.log("---------------------------------------");

    } catch (error) {
        console.error("❌ Lỗi:", error);
    } finally {
        process.exit();
    }
};

createLoginAccountOnly();