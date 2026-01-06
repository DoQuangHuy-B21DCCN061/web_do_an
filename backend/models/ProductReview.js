// backend/models/ProductReview.js
class ProductReview {
    constructor(id = null, rating = 0, comment = null, created_at = null,
        productsid = null, usersid = null, tbl_orderdetailsid = null, status = 1) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.created_at = created_at;
        this.productsid = productsid;
        this.usersid = usersid;
        this.tbl_orderdetailsid = tbl_orderdetailsid; // Khớp với hình ảnh
        this.status = status; // 1: Hiển thị, 0: Ẩn
    }

    setStatus(status) { this.status = status; }
}
module.exports = ProductReview;