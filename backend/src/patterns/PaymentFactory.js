// --- Abstract Products ---
class PaymentProcessor {
    generatePaymentInfo(order) { throw new Error("Phương thức chưa được triển khai"); }
}

class WebhookHandler {
    async process(req) { throw new Error("Phương thức chưa được triển khai"); }
}

// --- Concrete Products (SePay) ---
class SePayProcessor extends PaymentProcessor {
    generatePaymentInfo(order) {
        // Trả về thông tin để Frontend tạo QR
        return {
            method: 'bank_transfer',
            gateway: 'SePay',
            bank_code: 'MB', 
            amount: order.final_amount,
            content: `SAHAFA ${order.order_id}`,
            instruction: "Vui lòng quét mã QR hoặc chuyển khoản với nội dung chính xác."
        };
    }
}

class SePayWebhookHandler extends WebhookHandler {
    constructor(models, sequelize) {
        super();
        this.Order = models.Order;
        this.Transaction = models.Transaction;
        this.sequelize = sequelize;
    }

    async process(reqBody) {
        const { 
            gateway, transactionDate, accountNumber, transferAmount, 
            content, description, transferContent 
        } = reqBody;

        console.log(">>> [Chiến lược SePay] Đang xử lý:", JSON.stringify(reqBody));

        const paymentContent = content || description || transferContent || "";
        if (!paymentContent) return { success: true, message: 'Không tìm thấy nội dung' };

        const regex = /SAHAFA\s*(\d+)/i;
        const match = paymentContent.match(regex);
        if (!match) return { success: true, message: 'Cú pháp không khớp' };

        const orderId = match[1];

        const order = await this.Order.findByPk(orderId);
        if (!order) return { success: true, message: 'Không tìm thấy đơn hàng' };

        if (order.payment_status === 'paid') return { success: true, message: 'Đơn hàng đã được thanh toán' };

        const receivedAmount = parseFloat(transferAmount);
        const orderAmount = parseFloat(order.final_amount);

        if (receivedAmount < orderAmount) {
            console.warn(`>>> Thanh toán thiếu Đơn hàng ${orderId}`);
            return { success: true, message: 'Số tiền không đủ' };
        }

        await this.sequelize.transaction(async (t) => {
            await order.update({
                payment_status: 'paid',
                order_status: 'processing'
            }, { transaction: t });

            const pendingTx = await this.Transaction.findOne({
                where: {
                    order_id: order.order_id,
                    status: 'pending'
                }
            });

            if (pendingTx) {
                await pendingTx.update({
                    status: 'success',
                    payment_info: reqBody
                }, { transaction: t });
            } else {
                await this.Transaction.create({
                    payment_method: 'bank_transfer',
                    amount: receivedAmount,
                    status: 'success',
                    payment_info: reqBody,
                    order_id: order.order_id,
                    user_id: order.user_id
                }, { transaction: t });
            }
        });

        console.log(`>>> [Chiến lược SePay] Thành công Đơn hàng ${orderId}`);
        return { success: true, message: 'Đã xử lý thanh toán' };
    }
}

// --- Concrete Products (COD) ---
class CODProcessor extends PaymentProcessor {
    generatePaymentInfo(order) {
        return {
            method: 'cod',
            gateway: null,
            amount: order.final_amount,
            instruction: "Vui lòng chuẩn bị tiền mặt và thanh toán cho nhân viên giao hàng khi nhận hàng."
        };
    }
}

class CODWebhookHandler extends WebhookHandler {
    async process(reqBody) {
        // COD không hỗ trợ webhook
        return { success: false, message: 'COD không hỗ trợ webhooks' };
    }
}

// --- Abstract Factory ---
class PaymentFactory {
    createProcessor() { throw new Error("Phương thức chưa được triển khai"); }
    createWebhookHandler() { throw new Error("Phương thức chưa được triển khai"); }

    static getFactory(type, models, sequelize) {
        if (type === 'cod') return new CODFactory(models, sequelize);
        if (type === 'bank_transfer' || type === 'sepay' || type === 'vietqr') return new SePayFactory(models, sequelize);
        return null;
    }
}

// --- Concrete Factory (SePay) ---
class SePayFactory extends PaymentFactory {
    constructor(models, sequelize) {
        super();
        this.models = models;
        this.sequelize = sequelize;
    }

    createProcessor() {
        return new SePayProcessor();
    }

    createWebhookHandler() {
        return new SePayWebhookHandler(this.models, this.sequelize);
    }
}

// --- Concrete Factory (COD) ---
class CODFactory extends PaymentFactory {
    constructor(models, sequelize) {
        super();
        this.models = models;
        // COD factory có thể không cần models, nhưng giữ constructor giống nhau để đồng bộ
    }

    createProcessor() {
        return new CODProcessor();
    }

    createWebhookHandler() {
        return new CODWebhookHandler();
    }
}

module.exports = { SePayFactory, CODFactory, PaymentFactory };
