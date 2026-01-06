// backend/dao/CustomerManageDAO.js
const { sql, poolPromise } = require('../config/db');
const Customer = require('../models/Customer');

class CustomerManageDAO {
    // 1. Hàm lấy danh sách khách hàng có phân trang, sắp tên từ A-Z
    async getCustomersPaging(page = 1, limit = 10, search = '') {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        let query = `SELECT id, username, name, phone, email, address, points, status FROM tbl_users WHERE role = 'USER'`;
        let countQuery = `SELECT COUNT(*) as total FROM tbl_users WHERE role = 'USER'`;
        const request = pool.request();
        const countRequest = pool.request();
        
        if (search && search.trim()) {
            query += ` AND name LIKE @search`;
            countQuery += ` AND name LIKE @search`;
            request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
            countRequest.input('search', sql.NVarChar(100), `%${search.trim()}%`);
        }
        
        query += ` ORDER BY name ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        request.input('limit', sql.Int, limit);
        request.input('offset', sql.Int, offset);
        
        const result = await request.query(query);
        const countResult = await countRequest.query(countQuery);
        const total = parseInt(countResult.recordset[0].total) || 0;
        
        return {
            customers: result.recordset.map(r => new Customer(
                r.id, r.username, r.name, r.phone, r.email, r.address, r.points,
                r.status ? 1 : 0
            )),
            total
        };
    }

    // 2. Hàm tự gọi để truy vấn thông tin chi tiết
    async getCustomer(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT id, username, name, phone, email, address, points, status FROM tbl_users WHERE id = @id');

        if (result.recordset.length > 0) {
            const r = result.recordset[0];
            return new Customer(r.id, r.username, r.name, r.phone, r.email, r.address, r.points, r.status ? 1 : 0);
        }
        return null;
    }

    // 3. Hàm changeCustomer cập nhật vào cơ sở dữ liệu
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
                .input('status', sql.Bit, data.status) // Truyền giá trị BIT (0 hoặc 1)
                .query(`UPDATE tbl_users 
                        SET name = @name, phone = @phone, email = @email, 
                            address = @address, points = @points, status = @status 
                        WHERE id = @id`);
            return true; // Trả về return(true) khi hợp lệ
        } catch (err) {
            console.error("Lỗi cập nhật Customer:", err.message);
            return false; // Trả về return(false) khi thất bại
        }
    }
}

module.exports = new CustomerManageDAO();