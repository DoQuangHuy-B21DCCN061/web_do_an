const { sql, poolPromise } = require('../config/db');
const Customer = require('../models/Customer');

class CustomerManageDAO {
    // 1. Lấy toàn bộ danh sách khách hàng - MỚI NHẤT Ở ĐẦU
    async getAllCustomer() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT id, username, name, phone, email, address, points, status 
                FROM tbl_users 
                WHERE role = 'USER' 
                ORDER BY id DESC
            `);

        return result.recordset.map(r => new Customer(
            r.id.trim(), // Xử lý khoảng trắng cho kiểu CHAR(10)
            r.username.trim(),
            r.name,
            r.phone ? r.phone.trim() : '',
            r.email ? r.email.trim() : '',
            r.address,
            r.points,
            r.status ? 1 : 0
        ));
    }

    // 2. Truy vấn thông tin chi tiết một khách hàng
    async getCustomer(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query(`
                SELECT id, username, name, phone, email, address, points, status 
                FROM tbl_users 
                WHERE id = @id
            `);

        if (result.recordset.length > 0) {
            const r = result.recordset[0];
            return new Customer(
                r.id.trim(),
                r.username.trim(),
                r.name,
                r.phone ? r.phone.trim() : '',
                r.email ? r.email.trim() : '',
                r.address,
                r.points,
                r.status ? 1 : 0
            );
        }
        return null;
    }

    // 3. Cập nhật thông tin khách hàng
    async changeCustomer(id, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('name', sql.NVarChar, data.name)
                .input('phone', sql.VarChar, data.phone)
                .input('email', sql.VarChar, data.email || '')
                .input('address', sql.NVarChar, data.address || '')
                .input('points', sql.Int, data.points || 0)
                .input('status', sql.Bit, data.status)
                .query(`
                    UPDATE tbl_users 
                    SET name = @name, 
                        phone = @phone, 
                        email = @email, 
                        address = @address, 
                        points = @points, 
                        status = @status 
                    WHERE id = @id
                `);
            return true;
        } catch (err) {
            console.error("Lỗi cập nhật Customer DAO:", err.message);
            return false;
        }
    }

    // 4. BỔ SUNG: Tìm kiếm khách hàng (Tìm theo Tên hoặc SĐT) - MỚI NHẤT Ở ĐẦU
    async searchCustomers(keyword) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('keyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT id, username, name, phone, email, address, points, status 
                FROM tbl_users 
                WHERE role = 'USER' AND (name LIKE @keyword OR phone LIKE @keyword)
                ORDER BY id DESC
            `);

        return result.recordset.map(r => new Customer(
            r.id.trim(), r.username.trim(), r.name, r.phone.trim(),
            r.email.trim(), r.address, r.points, r.status ? 1 : 0
        ));
    }
}

module.exports = new CustomerManageDAO();