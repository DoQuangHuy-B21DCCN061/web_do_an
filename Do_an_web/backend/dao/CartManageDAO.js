const { sql, poolPromise } = require('../config/db');
const { generateNextId } = require('../utils/idGenerator');

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
    async syncCartItem(userId, productId, quantity) {
        try {
            const pool = await poolPromise;
            const uId = userId.trim();
            const pId = productId.trim();

            // Bước A: Lấy hoặc tạo Cart ID
            let cartRes = await pool.request()
                .input('userId', sql.Char(10), uId)
                .query('SELECT id FROM tbl_carts WHERE TRIM(usersid) = TRIM(@userId)');

            let cartId;
            if (cartRes.recordset.length === 0) {
                // Tạo ID mới cho tbl_carts (pattern: 3 chữ cái đầu + số từ 100)
                const newCartId = await generateNextId('tbl_carts');
                let newCart = await pool.request()
                    .input('id', sql.Char(10), newCartId)
                    .input('userId', sql.Char(10), uId)
                    .query('INSERT INTO tbl_carts (id, usersid) VALUES (@id, @userId)');
                cartId = newCartId;
            } else {
                cartId = cartRes.recordset[0].id;
            }

            // Bước B: Thao tác trên tbl_cartitems
            const itemCheck = await pool.request()
                .input('cartId', sql.Char(10), cartId)
                .input('prodId', sql.Char(10), pId)
                .query('SELECT id FROM tbl_cartitems WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');

            if (itemCheck.recordset.length > 0) {
                if (quantity <= 0) {
                    await pool.request()
                        .input('cartId', sql.Char(10), cartId)
                        .input('prodId', sql.Char(10), pId)
                        .query('DELETE FROM tbl_cartitems WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');
                } else {
                    await pool.request()
                        .input('cartId', sql.Char(10), cartId)
                        .input('prodId', sql.Char(10), pId)
                        .input('qty', sql.Int, quantity)
                        .query('UPDATE tbl_cartitems SET quantity = @qty WHERE cartsid = @cartId AND TRIM(productsid) = TRIM(@prodId)');
                }
            } else if (quantity > 0) {
                // TẠO ID MỚI CHO tbl_cartitems (pattern: 3 chữ cái đầu + số từ 100)
                const newItemId = await generateNextId('tbl_cartitems');
                await pool.request()
                    .input('id', sql.Char(10), newItemId)
                    .input('cartId', sql.Char(10), cartId)
                    .input('prodId', sql.Char(10), pId)
                    .input('qty', sql.Int, quantity)
                    .query('INSERT INTO tbl_cartitems (id, cartsid, productsid, quantity) VALUES (@id, @cartId, @prodId, @qty)');
            }
            return true;
        } catch (error) {
            console.error("Lỗi syncCartItem:", error);
            return false;
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