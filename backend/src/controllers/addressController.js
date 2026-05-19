const { models, sequelize } = require('../config/database');
const { Address } = models;

// Lấy danh sách địa chỉ của người dùng hiện tại
const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user_id || (req.user && req.user.user_id); 

    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [
        ['is_default', 'DESC'], 
        ['address_id', 'DESC']
      ] 
    });
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Lỗi lấy địa chỉ:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Thêm địa chỉ mới
const addAddress = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { recipient_name, phone, address_detail, is_default } = req.body;
    const userId = req.user_id || (req.user && req.user.user_id);

    const count = await Address.count({ where: { user_id: userId } });
    
    // Địa chỉ đầu tiên mặc định là địa chỉ mặc định
    const shouldBeDefault = count === 0 || is_default;

    if (shouldBeDefault) {
      await Address.update({ is_default: false }, { 
        where: { user_id: userId },
        transaction: t 
      });
    }

    const newAddr = await Address.create({
      user_id: userId,
      recipient_name,
      phone,
      address_detail,
      is_default: shouldBeDefault
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: 'Đã thêm địa chỉ', data: newAddr });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi thêm địa chỉ:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Cập nhật địa chỉ
const updateAddress = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { recipient_name, phone, address_detail, is_default } = req.body;
    const userId = req.user_id || (req.user && req.user.user_id);

    const addr = await Address.findOne({ where: { address_id: id, user_id: userId } });
    if (!addr) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }

    if (is_default) {
      await Address.update({ is_default: false }, { 
        where: { user_id: userId },
        transaction: t 
      });
    }

    await addr.update({
      recipient_name,
      phone,
      address_detail,
      is_default: is_default !== undefined ? is_default : addr.is_default
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi cập nhật địa chỉ:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user_id || (req.user && req.user.user_id);

    const deleted = await Address.destroy({ where: { address_id: id, user_id: userId } });
    
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    
    res.json({ success: true, message: 'Đã xóa địa chỉ' });
  } catch (error) {
    console.error("Lỗi xóa địa chỉ:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = { getMyAddresses, addAddress, updateAddress, deleteAddress };