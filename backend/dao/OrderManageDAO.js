const { sql, poolPromise } = require('../config/db');
const Order = require('../models/Order');

class OrderManageDAO {
    // --- HÀM XỬ LÝ ĐẶT HÀNG (PLACE ORDER) ---
    async placeOrder(data) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            let finalUserId = data.userId;

            // 1. Xử lý khách vãng lai
            if (!finalUserId) {
                const checkUser = await transaction.request()
                    .input('phone', sql.Char(12), data.customerInfo.phone)
                    .query('SELECT id FROM tbl_users WHERE phone = @phone');

                if (checkUser.recordset.length > 0) {
                    finalUserId = checkUser.recordset[0].id;
                } else {
                    finalUserId = ('USR' + data.customerInfo.phone.trim()).slice(0, 10);
                    await transaction.request()
                        .input('id', sql.Char(10), finalUserId)
                        .input('username', sql.Char(50), data.customerInfo.phone)
                        .input('pass', sql.Char(256), '123456')
                        .input('role', sql.NVarChar(100), 'USER')
                        .input('name', sql.NVarChar(50), data.customerInfo.name)
                        .input('phone', sql.Char(12), data.customerInfo.phone)
                        .input('addr', sql.NVarChar(250), data.customerInfo.address)
                        .query(`INSERT INTO tbl_users (id, username, password_hash, role, name, phone, address, status) 
                                VALUES (@id, @username, @pass, @role, @name, @phone, @addr, 1)`);
                }
            }

            // 2. Tạo đơn hàng mới - ID chứa timestamp giúp sắp xếp chính xác
            const orderId = ('ORD' + Date.now().toString()).slice(-10);
            await transaction.request()
                .input('id', sql.Char(10), orderId)
                .input('uId', sql.Char(10), finalUserId)
                .input('name', sql.NVarChar(30), data.customerInfo.name)
                .input('addr', sql.NVarChar(100), data.customerInfo.address)
                .input('phone', sql.Char(12), data.customerInfo.phone)
                .input('method', sql.NVarChar(11), data.paymentMethod)
                .query(`INSERT INTO tbl_orders (id, order_date, receiver_name, receiver_address, receiver_phone, payment_method, status, usersid) 
                        VALUES (@id, GETDATE(), @name, @addr, @phone, @method, N'Chờ xác nhận', @uId)`);

            // 3. Lưu chi tiết đơn hàng và cập nhật tồn kho
            for (const item of data.items) {
                const detailId = ('DT' + Math.random().toString(36).toUpperCase().slice(2, 10)).slice(0, 10);
                await transaction.request()
                    .input('id', sql.Char(10), detailId)
                    .input('qty', sql.Int, item.quantity)
                    .input('price', sql.Float, item.price)
                    .input('pId', sql.Char(50), item.productsid)
                    .input('oId', sql.Char(10), orderId)
                    .query(`INSERT INTO tbl_orderdetails (id, quantity, price, productsid, ordersid) 
                            VALUES (@id, @qty, @price, @pId, @oId)`);

                await transaction.request()
                    .input('pId', sql.Char(50), item.productsid)
                    .input('qty', sql.Int, item.quantity)
                    .query('UPDATE tbl_products SET quantityInStock = quantityInStock - @qty WHERE id = @pId');
            }

            // 4. Xóa giỏ hàng
            if (data.userId) {
                await transaction.request()
                    .input('uId', sql.Char(10), data.userId)
                    .query(`DELETE FROM tbl_cartitems WHERE cartsid IN (SELECT id FROM tbl_carts WHERE usersid = @uId)`);
            }

            await transaction.commit();
            return { success: true, message: "Đặt hàng thành công!", orderId: orderId };

        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    // --- LẤY TẤT CẢ ĐƠN HÀNG (ADMIN) - MỚI NHẤT Ở ĐẦU ---
    async getAllOrder() {
        const pool = await poolPromise;
        // Kết hợp sắp xếp theo ngày và ID để đảm bảo tính tuyệt đối
        const result = await pool.request().query("SELECT * FROM tbl_orders ORDER BY order_date DESC, id DESC");
        return result.recordset.map(r => new Order(
            r.id.trim(), r.order_date, r.used_points, r.receiver_name,
            r.receiver_address, r.receiver_phone, r.payment_method,
            r.status, r.usersid.trim()
        ));
    }

    // --- LẤY ĐƠN HÀNG CỦA USER (KHÁCH HÀNG) - MỚI NHẤT Ở ĐẦU ---
    async getOrdersByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Char(10), userId)
            .query(`SELECT id, order_date, status, usersid FROM tbl_orders 
                    WHERE usersid = @userId 
                    ORDER BY order_date DESC, id DESC`);

        return result.recordset.map(row => new Order(
            row.id.trim(), row.order_date, 0, null, null, null, null,
            row.status.trim(), row.usersid.trim()
        ));
    }

    // --- LẤY CHI TIẾT 1 ĐƠN HÀNG ---
    async getOrder(id) {
        const pool = await poolPromise;
        const orderRes = await pool.request()
            .input('id', sql.Char(10), id)
            .query("SELECT * FROM tbl_orders WHERE id = @id");

        if (orderRes.recordset.length === 0) return null;

        const detailsRes = await pool.request()
            .input('id', sql.Char(10), id)
            .query(`
                SELECT od.*, p.name as product_name 
                FROM tbl_orderdetails od
                JOIN tbl_products p ON od.productsid = p.id
                WHERE od.ordersid = @id
            `);

        return {
            ...orderRes.recordset[0],
            items: detailsRes.recordset
        };
    }

    // --- CÁC HÀM CẬP NHẬT ---
    async setOrderPaymentStatus(orderId, status) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Char(10), orderId)
            .input('status', sql.NVarChar(100), status)
            .query(`UPDATE tbl_orders SET status = @status WHERE id = @id`);
        return true;
    }

    async changeOrder(id, data) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Char(10), id)
            .input('status', sql.NVarChar(30), data.status)
            .input('name', sql.NVarChar(30), data.receiver_name)
            .input('addr', sql.NVarChar(100), data.receiver_address)
            .input('phone', sql.Char(12), data.receiver_phone)
            .query(`UPDATE tbl_orders SET status = @status, receiver_name = @name, 
                    receiver_address = @addr, receiver_phone = @phone WHERE id = @id`);
        return result.rowsAffected[0] > 0;
    }

    async cancelOrder(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Char(10), id)
            .query("UPDATE tbl_orders SET status = N'Đã hủy' WHERE id = @id");
        return { success: result.rowsAffected[0] > 0 };
    }
}

module.exports = new OrderManageDAO();