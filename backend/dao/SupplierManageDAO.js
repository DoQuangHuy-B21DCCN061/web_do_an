const { sql, poolPromise } = require('../config/db');
const Supplier = require('../models/Supplier');

class SupplierManageDAO {
    // 1. Hàm hỗ trợ tạo ID tự động (Giữ nguyên)
    async generateNextId(tableName, prefix) {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT TOP 1 id FROM ${tableName} ORDER BY id DESC`);

        if (result.recordset.length === 0) return `${prefix}01`;

        const lastId = result.recordset[0].id;
        const lastNumber = parseInt(lastId.replace(prefix, ''), 10);
        const nextNumber = lastNumber + 1;

        return `${prefix}${nextNumber.toString().padStart(2, '0')}`;
    }

    // 2. Hàm lấy danh sách nhà cung cấp - ĐÃ CẬP NHẬT: Mới nhất ở đầu
    async getAllSupplier() {
        const pool = await poolPromise;
        // Thêm ORDER BY id DESC để nhà cung cấp có ID lớn nhất (mới nhất) hiện lên đầu
        const result = await pool.request().query('SELECT * FROM tbl_suppliers ORDER BY id DESC');
        return result.recordset.map(row => new Supplier(row.id, row.name, row.phone, row.address, row.email));
    }

    // 3. Hàm lấy chi tiết (Giữ nguyên)
    async getSupplier(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT * FROM tbl_suppliers WHERE id = @id');

        if (result.recordset.length > 0) {
            const d = result.recordset[0];
            return new Supplier(d.id, d.name, d.phone, d.address, d.email);
        }
        return null;
    }

    // 4. Hàm cập nhật (Giữ nguyên)
    async changeDataSupplier(id, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('name', sql.NVarChar, data.name)
                .input('phone', sql.VarChar, data.phone)
                .input('email', sql.VarChar, data.email || '')
                .input('address', sql.NVarChar, data.address || '')
                .query(`
                UPDATE tbl_suppliers 
                SET name = @name, 
                    phone = @phone, 
                    email = @email, 
                    address = @address 
                WHERE id = @id
            `);
            return true;
        } catch (err) {
            console.error("Lỗi cập nhật DAO:", err.message);
            return false;
        }
    }

    // 5. Hàm thêm mới (Giữ nguyên)
    async addSupplier(data) {
        try {
            const pool = await poolPromise;
            const nextId = await this.generateNextId('tbl_suppliers', 'SUP');

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

    // 6. Hàm xoá (Giữ nguyên)
    async deleteSupplier(id) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .query('DELETE FROM tbl_suppliers WHERE id = @id');
            return true;
        } catch (err) {
            return false;
        }
    }
}

module.exports = new SupplierManageDAO();