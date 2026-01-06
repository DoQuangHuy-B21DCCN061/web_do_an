// backend/dao/CategoryManageDAO.js
const { sql, poolPromise } = require('../config/db');
const Category = require('../models/Category');
const { generateNextId } = require('../utils/idGenerator');

class CategoryManageDAO {
    async getCategoriesPaging(page = 1, limit = 10, search = '') {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM tbl_categories';
        let countQuery = 'SELECT COUNT(*) as total FROM tbl_categories';
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
        
        const categories = await request.query(query);
        const totalRes = await countRequest.query(countQuery);
        const total = totalRes.recordset[0] ? parseInt(totalRes.recordset[0].total) : 0;
        
        return {
            categories: categories.recordset.map(r => new Category(r.id, r.name)),
            total
        };
    }

    // Hàm getAllCategory(): Trả danh sách về cho UICategoryManage
    async getAllCategory(search = '') {
        const pool = await poolPromise;
        let query = 'SELECT * FROM tbl_categories';
        const request = pool.request();
        
        if (search && search.trim()) {
            query += ' WHERE name LIKE @search';
            request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
        }
        
        const result = await request.query(query);
        return result.recordset.map(r => new Category(r.id, r.name));
    }

    // Hàm getCategory(): Truy vấn dữ liệu từ lớp thực thể Category
    async getCategory(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT * FROM tbl_categories WHERE id = @id');
        if (result.recordset.length > 0) {
            const r = result.recordset[0];
            return new Category(r.id, r.name);
        }
        return null;
    }

    // Hàm changeCategory(): Cập nhật vào cơ sở dữ liệu
    async changeCategory(id, data) {
        try {
            // Kiểm tra thông tin hợp lệ (Ví dụ: tên không được để trống)
            if (!data.name || data.name.trim() === "") return false;

            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('name', sql.NVarChar, data.name)
                .query('UPDATE tbl_categories SET name = @name WHERE id = @id');
            return true; // Trả về return(true)
        } catch (err) {
            return false; // Trả về return(false)
        }
    }

    // Kiểm tra tên danh mục trùng
    async checkDuplicateName(name, excludeId = null) {
        try {
            const pool = await poolPromise;
            let query = `SELECT COUNT(*) as count FROM tbl_categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(@name))`;
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
}

module.exports = new CategoryManageDAO();