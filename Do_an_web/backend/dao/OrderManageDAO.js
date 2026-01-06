const { sql, poolPromise } = require('../config/db');
const Order = require('../models/Order');
const { generateNextId } = require('../utils/idGenerator');

class OrderManageDAO {
    async placeOrder(data) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            let finalUserId = data.userId;

            // 1. Xử lý khách vãng lai (Giữ nguyên logic id)
            if (!finalUserId) {
                const checkUser = await transaction.request()
                    .input('phone', sql.Char(12), data.customerInfo.phone)
                    .query('SELECT id FROM tbl_users WHERE phone = @phone');

                if (checkUser.recordset.length > 0) {
                    finalUserId = checkUser.recordset[0].id;
                } else {
                    // Tạo ID mới cho user (pattern: 3 chữ cái đầu + số từ 100)
                    finalUserId = await generateNextId('tbl_users');
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

            // 2. Tạo đơn hàng mới - SỬA TÊN CỘT userid -> usersid
            const orderId = await generateNextId('tbl_orders');
            await transaction.request()
                .input('id', sql.Char(10), orderId)
                .input('uId', sql.Char(10), finalUserId)
                .input('name', sql.NVarChar(30), data.customerInfo.name)
                .input('addr', sql.NVarChar(100), data.customerInfo.address)
                .input('phone', sql.Char(12), data.customerInfo.phone)
                .input('method', sql.NVarChar(11), data.paymentMethod)
                .query(`INSERT INTO tbl_orders (id, order_date, receiver_name, receiver_address, receiver_phone, payment_method, status, usersid) 
                        VALUES (@id, GETDATE(), @name, @addr, @phone, @method, N'Chờ xác nhận', @uId)`);

            // 3. Lưu chi tiết đơn hàng
            // Tối ưu: Tạo tất cả ID một lần thay vì tạo từng ID trong vòng lặp
            const detailIds = await generateNextId('tbl_orderdetails', data.items.length);
            
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                const detailId = detailIds[i];
                
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

            // 4. Xóa giỏ hàng - SỬA TÊN CỘT userid -> usersid (trong bảng tbl_carts)
            if (data.userId) {
                await transaction.request()
                    .input('uId', sql.Char(10), data.userId)
                    .query(`DELETE FROM tbl_cartitems WHERE cartsid IN (SELECT id FROM tbl_carts WHERE usersid = @uId)`);
            }

            // 3.5. Tạo bill cho đơn hàng
            if (data.items && data.items.length > 0) {
                const totalAmount = data.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
                const totalPrice = data.items.reduce((sum, it) => sum + (it.quantity * it.price || 0), 0);
                const billId = await generateNextId('tbl_bills');
                await transaction.request()
                    .input('id', sql.Char(10), billId)
                    .input('bill_date', sql.DateTime, new Date())
                    .input('total_amount', sql.Int, totalAmount)
                    .input('total_price', sql.Float, totalPrice)
                    .input('usersid', sql.Char(10), finalUserId)
                    .input('ordersid', sql.Char(10), orderId)
                    .query(`INSERT INTO tbl_bills (id, bill_date, total_amount, total_price, usersid, ordersid)
                            VALUES (@id, @bill_date, @total_amount, @total_price, @usersid, @ordersid)`);
            }
            await transaction.commit();
            return { success: true, message: "Đặt hàng thành công!", orderId };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async getAllOrder() {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM tbl_orders ORDER BY order_date DESC");
        return result.recordset.map(r => new Order(r.id, r.order_date, r.used_points, r.receiver_name, r.receiver_address, r.receiver_phone, r.payment_method, r.status, r.usersid));
    }

    async getAllOrderPaging(page = 1, limit = 10, search = '') {
        try {
            const pool = await poolPromise;
            const offset = (page - 1) * limit;
            
            // Thử dùng OFFSET/FETCH (SQL Server 2012+)
            try {
                let query = `SELECT * FROM tbl_orders`;
                let countQuery = `SELECT COUNT(*) as total FROM tbl_orders`;
                const request = pool.request();
                
                // Thêm điều kiện tìm kiếm nếu có
                if (search && search.trim()) {
                    query += ` WHERE receiver_name LIKE @search`;
                    countQuery += ` WHERE receiver_name LIKE @search`;
                    request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
                }
                
                query += ` ORDER BY order_date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
                
                request.input('limit', sql.Int, limit);
                request.input('offset', sql.Int, offset);
                
                const res = await request.query(query);
                
                // Đếm tổng với điều kiện tìm kiếm
                const countRequest = pool.request();
                if (search && search.trim()) {
                    countRequest.input('search', sql.NVarChar(100), `%${search.trim()}%`);
                }
                const countRes = await countRequest.query(countQuery);
                const total = parseInt(countRes.recordset[0].total) || 0;
                
                return {
                    orders: res.recordset.map(r => new Order(r.id, r.order_date, r.used_points, r.receiver_name, r.receiver_address, r.receiver_phone, r.payment_method, r.status, r.usersid)),
                    total: total
                };
            } catch (offsetError) {
                // Fallback: Nếu OFFSET/FETCH không hoạt động, dùng cách khác
                let query = "SELECT * FROM tbl_orders";
                const request = pool.request();
                
                if (search && search.trim()) {
                    query += ` WHERE receiver_name LIKE @search`;
                    request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
                }
                
                query += " ORDER BY order_date DESC";
                const allRes = await request.query(query);
                const allOrders = allRes.recordset.map(r => new Order(r.id, r.order_date, r.used_points, r.receiver_name, r.receiver_address, r.receiver_phone, r.payment_method, r.status, r.usersid));
                const total = allOrders.length;
                const startIndex = offset;
                const endIndex = startIndex + limit;
                const paginatedOrders = allOrders.slice(startIndex, endIndex);
                return {
                    orders: paginatedOrders,
                    total: total
                };
            }
        } catch (err) {
            throw err;
        }
    }

    async getOrdersByUserId(userId) {
        const pool = await poolPromise;
        // SỬA TÊN CỘT userid -> usersid
        const result = await pool.request()
            .input('userId', sql.Char(10), userId)
            .query(`SELECT id, order_date, status, usersid FROM tbl_orders WHERE usersid = @userId ORDER BY order_date DESC`);

        return result.recordset.map(row => new Order(
            row.id.trim(),
            row.order_date,
            0, null, null, null, null,
            row.status.trim(),
            row.usersid.trim()
        ));
    }

    // Lấy thông tin 1 đơn hàng theo ID
    async getOrder(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Char(10), id)
                .query("SELECT * FROM tbl_orders WHERE id = @id");
            if (result.recordset.length > 0) {
                const r = result.recordset[0];
                return new Order(r.id, r.order_date, r.used_points, r.receiver_name, r.receiver_address, r.receiver_phone, r.payment_method, r.status, r.usersid);
            }
            return null;
        } catch (err) {
            throw err;
        }
    }

    // Cập nhật thông tin đơn hàng
    async changeOrder(id, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.Char(10), id)
                .input('receiver_name', sql.NVarChar(50), data.receiver_name || '')
                .input('receiver_address', sql.NVarChar(250), data.receiver_address || '')
                .input('receiver_phone', sql.Char(12), data.receiver_phone || '')
                .input('status', sql.NVarChar(100), data.status || '')
                .query(`UPDATE tbl_orders 
                        SET receiver_name = @receiver_name, 
                            receiver_address = @receiver_address, 
                            receiver_phone = @receiver_phone, 
                            status = @status 
                        WHERE id = @id`);
            return true;
        } catch (err) {
            return false;
        }
    }

    // Cập nhật trạng thái thanh toán của đơn hàng (dùng cho VNPay IPN)
    async setOrderPaymentStatus(orderId, status) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Char(10), orderId)
            .input('status', sql.NVarChar(100), status)
            .query(`UPDATE tbl_orders SET status = @status WHERE id = @id`);
        return true;
    }
}

module.exports = new OrderManageDAO();

