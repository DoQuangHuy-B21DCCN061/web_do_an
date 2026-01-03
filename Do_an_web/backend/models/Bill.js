// backend/models/Bill.js
class Bill {
    // Đổi tham số và thuộc tính sang total_price
    constructor(id = null, total_price = 0, bill_date = null) {
        this.id = id;
        this.total_price = total_price; // Đồng nhất tên
        this.bill_date = bill_date;
    }

    setTotalPrice(price) { this.total_price = price; }
}
module.exports = Bill;