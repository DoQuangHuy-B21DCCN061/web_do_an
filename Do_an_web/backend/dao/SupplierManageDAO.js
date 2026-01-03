// backend/dao/SupplierManageDAO.js
const { sql, poolPromise } = require('../config/db');
const Supplier = require('../models/Supplier');
const { generateNextId } = require('../utils/idGenerator');

class SupplierManageDAO {
    async getSuppliersPaging(page = 1, limit = 10, search = '') {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM tbl_suppliers';
        let countQuery = 'SELECT COUNT(*) as total FROM tbl_suppliers';
        const request = pool.request();
        const countRequest = pool.request();
        
        if (search && search.trim()) {
            query += ' WHERE name LIKE @search';
            countQuery += ' WHERE name LIKE @search';
            request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
            countRequest.input('search', sql.NVarChar(100), `%${search.trim()}%`);
        }
        
        query += ' ORDER BY name ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        const suppliers = await request.query(query);
        const totalRes = await countRequest.query(countQuery);
        const total = totalRes.recordset[0] ? parseInt(totalRes.recordset[0].total) : 0;
        
        return {
            suppliers: suppliers.recordset.map(row => new Supplier(row.id, row.name, row.phone, row.address, row.email)),
            total
        };
    }

    // 2. Hàm lấy danh sách nhà cung cấp
    async getAllSupplier(search = '') {
        const pool = await poolPromise;
        let query = 'SELECT * FROM tbl_suppliers';
        const request = pool.request();
        
        if (search && search.trim()) {
            query += ' WHERE name LIKE @search';
            request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
        }
        
        const result = await request.query(query);
        return result.recordset.map(row => new Supplier(row.id, row.name, row.phone, row.address, row.email));
    }

    // 3. Hàm lấy chi tiết (Dùng sql.VarChar cho ID chuỗi như 'SUP01')
    async getSupplier(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id) // ĐÃ SỬA: Dùng VarChar thay vì Int
            .query('SELECT * FROM tbl_suppliers WHERE id = @id');

        if (result.recordset.length > 0) {
            const d = result.recordset[0];
            return new Supplier(d.id, d.name, d.phone, d.address, d.email);
        }
        return null;
    }

    // 4. Hàm cập nhật thông tin đầy đủ các trường
    async changeDataSupplier(id, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                // Thiết lập các tham số đầu vào với kiểu dữ liệu tương ứng
                .input('id', sql.VarChar, id)         // ID dạng chuỗi 'SUPxx'
                .input('name', sql.NVarChar, data.name)
                .input('phone', sql.VarChar, data.phone)
                .input('email', sql.VarChar, data.email || '')     // Cho phép rỗng nếu không nhập
                .input('address', sql.NVarChar, data.address || '') // Kiểu NVarChar cho tiếng Việt có dấu
                .query(`
                UPDATE tbl_suppliers 
                SET name = @name, 
                    phone = @phone, 
                    email = @email, 
                    address = @address 
                WHERE id = @id
            `);

            return true; // Trả về return(true) khi cập nhật thành công
        } catch (err) {
            console.error("Lỗi cập nhật DAO:", err.message);
            return false; // Trả về return(false) khi có lỗi xảy ra
        }
    }

    // 5. Hàm thêm mới với logic tự động tạo ID
    async addSupplier(data) {
        try {
            const pool = await poolPromise;

            // Bước 1: Tự động tạo ID mới (pattern: 3 chữ cái đầu + số từ 100)
            const nextId = await generateNextId('tbl_suppliers');

            // Bước 2: Thực hiện lệnh chèn với nextId (Kiểu dữ liệu VarChar)
            await pool.request()
                .input('id', sql.VarChar, nextId)
                .input('name', sql.NVarChar, data.name)
                .input('phone', sql.VarChar, data.phone)
                .input('email', sql.VarChar, data.email || '')
                .input('address', sql.NVarChar, data.address || '')
                .query(`INSERT INTO tbl_suppliers (id, name, phone, email, address) 
                        VALUES (@id, @name, @phone, @email, @address)`);

            return true;
        } catch (err) {
            console.error("Lỗi DAO (addSupplier):", err.message);
            return false;
        }
    }

    // 6. Hàm xoá (Dùng sql.VarChar cho ID chuỗi)
    async deleteSupplier(id) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id) // ĐÃ SỬA: ID chuỗi không dùng sql.Int
                .query('DELETE FROM tbl_suppliers WHERE id = @id');
            return true;
        } catch (err) {
            return false;
        }
    }

    // 7. Kiểm tra tên nhà cung cấp trùng
    async checkDuplicateName(name, excludeId = null) {
        try {
            const pool = await poolPromise;
            let query = `SELECT COUNT(*) as count FROM tbl_suppliers WHERE LOWER(TRIM(name)) = LOWER(TRIM(@name))`;
            const request = pool.request();
            request.input('name', sql.NVarChar, name);
            
            if (excludeId) {
                query += ` AND id != @excludeId`;
                request.input('excludeId', sql.VarChar, excludeId);
            }
            
            const result = await request.query(query);
            return parseInt(result.recordset[0].count) > 0;
        } catch (err) {
            console.error("Lỗi checkDuplicateName:", err);
            return false;
        }
    }

    // 8. Kiểm tra số điện thoại trùng
    async checkDuplicatePhone(phone, excludeId = null) {
        try {
            const pool = await poolPromise;
            let query = `SELECT COUNT(*) as count FROM tbl_suppliers WHERE TRIM(phone) = TRIM(@phone)`;
            const request = pool.request();
            request.input('phone', sql.VarChar, phone);
            
            if (excludeId) {
                query += ` AND id != @excludeId`;
                request.input('excludeId', sql.VarChar, excludeId);
            }
            
            const result = await request.query(query);
            return parseInt(result.recordset[0].count) > 0;
        } catch (err) {
            console.error("Lỗi checkDuplicatePhone:", err);
            return false;
        }
    }

    // 9. Kiểm tra email trùng (chỉ kiểm tra nếu email không rỗng)
    async checkDuplicateEmail(email, excludeId = null) {
        try {
            if (!email || email.trim() === '') return false; // Email rỗng không cần kiểm tra
            
            const pool = await poolPromise;
            let query = `SELECT COUNT(*) as count FROM tbl_suppliers WHERE LOWER(TRIM(email)) = LOWER(TRIM(@email))`;
            const request = pool.request();
            request.input('email', sql.VarChar, email);
            
            if (excludeId) {
                query += ` AND id != @excludeId`;
                request.input('excludeId', sql.VarChar, excludeId);
            }
            
            const result = await request.query(query);
            return parseInt(result.recordset[0].count) > 0;
        } catch (err) {
            console.error("Lỗi checkDuplicateEmail:", err);
            return false;
        }
    }
}

module.exports = new SupplierManageDAO();