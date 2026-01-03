const { sql, poolPromise } = require('../config/db');
const ProductReview = require('../models/ProductReview');

class ReviewManagerDAO {
    // 1. Lấy danh sách đánh giá theo mã sản phẩm (Dành cho Admin)
    async getAllReview(productId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('productId', sql.Char(50), productId) // tbl_products.id là CHAR(50)
                .query(`SELECT r.*, u.name as user_name 
                        FROM tbl_productreviews r 
                        JOIN tbl_users u ON r.usersid = u.id 
                        WHERE r.productsid = @productId`);

            return result.recordset.map(row => ({
                ...new ProductReview(
                    row.id.trim(), row.rating, row.comment, row.created_at,
                    row.productsid.trim(), row.usersid.trim(), row.tbl_orderdetailsid.trim()
                ),
                status: row.status ? 1 : 0,
                user_name: row.user_name
            }));
        } catch (error) {
            console.error("DAO Error (getAllReview):", error);
            throw error;
        }
    }

    // 2. Thay đổi trạng thái hiển thị (Dành cho Admin)
    async changeStatus(id, status) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.Char(10), id)
                .input('status', sql.Bit, status)
                .query('UPDATE tbl_productreviews SET status = @status WHERE id = @id');
            return true;
        } catch (err) {
            console.error("DAO Error (changeStatus):", err);
            return false;
        }
    }

    // 3. Lấy đánh giá cá nhân (Dành cho Khách hàng)
    async getReviewsByUserId(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Char(10), userId)
                .query(`
                    SELECT r.*, p.name as product_name 
                    FROM tbl_productreviews r
                    JOIN tbl_products p ON r.productsid = p.id
                    WHERE r.usersid = @userId
                `);

            return result.recordset.map(row => ({
                ...row,
                id: row.id.trim(),
                product_name: row.product_name.trim()
            }));
        } catch (error) {
            console.error("DAO Error (getReviewsByUserId):", error);
            throw error;
        }
    }

    // 4. Cập nhật nội dung đánh giá (Dành cho Khách hàng - changeReview)
    async changeReview(id, data) {
        try {
            const pool = await poolPromise;

            // Gói dữ liệu vào thực thể để chuẩn hóa logic (Bước 22, 23)
            const reviewEntity = new ProductReview();
            reviewEntity.id = id;
            if (reviewEntity.setRating) reviewEntity.setRating(data.rating);
            if (reviewEntity.setComment) reviewEntity.setComment(data.comment);

            await pool.request()
                .input('id', sql.Char(10), id)
                .input('rating', sql.Int, data.rating)
                .input('comment', sql.NVarChar, data.comment)
                .query(`UPDATE tbl_productreviews 
                        SET rating = @rating, comment = @comment 
                        WHERE id = @id`);

            return { success: true, review: reviewEntity };
        } catch (error) {
            console.error("DAO Error (changeReview):", error);
            return { success: false, message: "Không thể cập nhật đánh giá" };
        }
    }
}

module.exports = new ReviewManagerDAO();