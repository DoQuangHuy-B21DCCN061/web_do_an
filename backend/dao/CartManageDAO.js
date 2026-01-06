const { sql, poolPromise } = require('../config/db');

class CartManageDAO {
    // 1. Lấy giỏ hàng
    async getCartByUserId(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Char(10), userId.trim())
                .query(`
                    SELECT ci.productsid, ci.quantity, p.name, p.sell_price, p.image_url 
                    FROM tbl_carts c
                    JOIN tbl_cartitems ci ON c.id = ci.cartsid
                    JOIN tbl_products p ON ci.productsid = p.id
                    WHERE TRIM(c.usersid) = TRIM(@userId)
                `);
            return result.recordset;
        } catch (error) {
            console.error("Lỗi getCartByUserId:", error);
            throw error;
        }
    }

    // 2. Đồng bộ sản phẩm (Sửa lỗi thiếu ID khi INSERT)
    // backend/dao/CartManageDAO.js

    async syncCartItem(userId, productId, quantity) {
        try {
            const pool = await poolPromise;
            const uId = userId.trim();
            const pId = productId.trim();

            // BƯỚC MỚI: Kiểm tra số lượng tồn kho thực tế
            const productRes = await pool.request()
                .input('prodId', sql.Char(10), pId)
                .query('SELECT quantityInStock FROM tbl_products WHERE id = @prodId');

            if (productRes.recordset.length === 0) return { success: false, message: "Sản phẩm không tồn tại" };

            const stock = productRes.recordset[0].quantityInStock;
            if (quantity > stock) {
                return { success: false, message: `Chỉ còn ${stock} sản phẩm trong kho`, currentStock: stock };
            }

            // --- Logic lấy/tạo Cart ID cũ giữ nguyên ---
            let cartRes = await pool.request()
                .input('userId', sql.Char(10), uId)
                .query('SELECT id FROM tbl_carts WHERE TRIM(usersid) = TRIM(@userId)');

            let cartId = cartRes.recordset.length === 0 ? null : cartRes.recordset[0].id;
            if (!cartId) {
                const newCartId = 'C' + Date.now().toString().slice(-9);
                await pool.request()
                    .input('id', sql.Char(10), newCartId)
                    .input('userId', sql.Char(10), uId)
                    .query('INSERT INTO tbl_carts (id, usersid) VALUES (@id, @userId)');
                cartId = newCartId;
            }

            // --- Logic Update/Insert Item ---
            const itemCheck = await pool.request()
                .input('cartId', sql.Char(10), cartId)
                .input('prodId', sql.Char(10), pId)
                .query('SELECT id FROM tbl_cartitems WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');

            if (itemCheck.recordset.length > 0) {
                if (quantity <= 0) {
                    await pool.request().input('cartId', sql.Char(10), cartId).input('prodId', sql.Char(10), pId)
                        .query('DELETE FROM tbl_cartitems WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');
                } else {
                    await pool.request().input('cartId', sql.Char(10), cartId).input('prodId', sql.Char(10), pId).input('qty', sql.Int, quantity)
                        .query('UPDATE tbl_cartitems SET quantity = @qty WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');
                }
            } else if (quantity > 0) {
                const newItemId = 'CI' + Date.now().toString().slice(-8);
                await pool.request().input('id', sql.Char(10), newItemId).input('cartId', sql.Char(10), cartId).input('prodId', sql.Char(10), pId).input('qty', sql.Int, quantity)
                    .query('INSERT INTO tbl_cartitems (id, cartsid, productsid, quantity) VALUES (@id, @cartId, @prodId, @qty)');
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // 3. BỔ SUNG HÀM MERGE (Thiếu hàm này dẫn đến lỗi khi login)
    async mergeCart(userId, items) {
        try {
            for (const item of items) {
                // productId lấy từ i.id.trim() của frontend gửi lên
                await this.syncCartItem(userId, item.productId, item.quantity);
            }
            return true;
        } catch (error) {
            console.error("Lỗi mergeCart:", error);
            return false;
        }
    }
}

module.exports = new CartManageDAO();