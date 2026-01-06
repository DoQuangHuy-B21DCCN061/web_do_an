const { sql, poolPromise } = require('../config/db');
const Category = require('../models/Category');

class CategoryManageDAO {
    // 1. Tự động tạo ID tiếp theo (Ví dụ: CAT04)
    async generateNextId(tableName, prefix) {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT TOP 1 id FROM ${tableName} ORDER BY id DESC`);

        if (result.recordset.length === 0) return `${prefix}01`;

        const lastId = result.recordset[0].id;
        const lastNumber = parseInt(lastId.replace(prefix, ''), 10);
        return `${prefix}${(lastNumber + 1).toString().padStart(2, '0')}`;
    }

    // 2. Lấy toàn bộ danh sách danh mục - ĐÃ CẬP NHẬT: Mới nhất ở đầu
    async getAllCategory() {
        const pool = await poolPromise;
        // Thêm ORDER BY id DESC để CAT mới nhất hiện lên trên cùng
        const result = await pool.request().query('SELECT * FROM tbl_categories ORDER BY id DESC');

        return result.recordset.map(r => new Category(
            r.id.trim(), // Thêm .trim() để xóa khoảng trắng của kiểu CHAR(10)
            r.name
        ));
    }

    // 3. Truy vấn thông tin chi tiết một danh mục
    async getCategory(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT * FROM tbl_categories WHERE id = @id');

        if (result.recordset.length > 0) {
            const r = result.recordset[0];
            return new Category(r.id.trim(), r.name);
        }
        return null;
    }

    // 4. Cập nhật tên danh mục
    async changeCategory(id, data) {
        try {
            if (!data.name || data.name.trim() === "") return false;

            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('name', sql.NVarChar, data.name)
                .query('UPDATE tbl_categories SET name = @name WHERE id = @id');

            return true;
        } catch (err) {
            console.error("Lỗi changeCategory DAO:", err.message);
            return false;
        }
    }

    // 5. BỔ SUNG: Thêm danh mục mới (để hoàn thiện bộ DAO)
    async addCategory(data) {
        try {
            const pool = await poolPromise;
            const nextId = await this.generateNextId('tbl_categories', 'CAT');

            await pool.request()
                .input('id', sql.VarChar, nextId)
                .input('name', sql.NVarChar, data.name)
                .query('INSERT INTO tbl_categories (id, name) VALUES (@id, @name)');

            return true;
        } catch (err) {
            console.error("Lỗi addCategory DAO:", err.message);
            return false;
        }
    }
}

module.exports = new CategoryManageDAO();