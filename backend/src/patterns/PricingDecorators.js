// Interface (Khái niệm)
class PriceComponent {
    async calculate() {
        throw new Error("Phương thức 'calculate()' phải được triển khai.");
    }
}

// Concrete Component: Giá cơ bản từ giỏ hàng
class BaseOrderPrice extends PriceComponent {
    constructor(cartItems) {
        super();
        this.cartItems = cartItems;
    }

    async calculate() {
        let total = 0;
        for (const item of this.cartItems) {
            total += parseFloat(item.Book.price) * item.quantity;
        }
        return total;
    }
}

// Decorator Base
class PriceDecorator extends PriceComponent {
    constructor(priceComponent) {
        super();
        this.priceComponent = priceComponent;
    }

    async calculate() {
        return this.priceComponent.calculate();
    }
}

// Decorator: Áp dụng Voucher
class VoucherDecorator extends PriceDecorator {
    constructor(priceComponent, voucher) {
        super(priceComponent);
        this.voucher = voucher;
    }

    async calculate() {
        let currentTotal = await super.calculate();
        
        if (!this.voucher) return currentTotal;

        // Logic tính giảm giá
        let discount = 0;
        if (this.voucher.discount_type === 'percent') {
            discount = currentTotal * (this.voucher.value / 100);
        } else {
            discount = parseFloat(this.voucher.value);
        }

        // Đảm bảo không giảm quá 100% (âm tiền)
        const finalPrice = currentTotal - discount;
        return finalPrice < 0 ? 0 : finalPrice;
    }
}

// Decorator: Phí vận chuyển (Ví dụ mở rộng)
class ShippingFeeDecorator extends PriceDecorator {
    constructor(priceComponent, fee = 0) {
        super(priceComponent);
        this.fee = fee;
    }

    async calculate() {
        const currentTotal = await super.calculate();
        // Ví dụ: Đơn > 500k miễn phí ship, ngược lại 30k
        if (currentTotal > 500000) {
            return currentTotal; 
        }
        return currentTotal + this.fee;
    }
}

module.exports = { BaseOrderPrice, VoucherDecorator, ShippingFeeDecorator };