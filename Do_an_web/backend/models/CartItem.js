class CartItem {
    constructor(productId, name, price, quantity, imageUrl) {
        this.productId = productId.trim(); // ID sản phẩm (đã cắt khoảng trắng)
        this.name = name;                  // Tên sản phẩm
        this.price = price;                // Đơn giá (VNĐ)
        this.quantity = quantity;          // Số lượng
        this.imageUrl = imageUrl;          // Link ảnh
    }

    // Hàm tính thành tiền cho riêng mặt hàng này
    getAmount() {
        return this.price * this.quantity;
    }
}

module.exports = CartItem;