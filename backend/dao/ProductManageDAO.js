const { sql, poolPromise } = require('../config/db');
const Product = require('../models/Product');

class ProductManageDAO {
    // Hàm tạo ID tự động với tiền tố 'PROD'
    async generateNextId(tableName, prefix) {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT TOP 1 id FROM ${tableName} ORDER BY id DESC`);
        if (result.recordset.length === 0) return `${prefix}01`;
        const lastId = result.recordset[0].id;
        const lastNumber = parseInt(lastId.replace(prefix, ''), 10);
        return `${prefix}${(lastNumber + 1).toString().padStart(2, '0')}`;
    }

    // 1. Lấy toàn bộ sản phẩm - MỚI NHẤT Ở ĐẦU
    async getAllProduct() {
        const pool = await poolPromise;
        // Thêm ORDER BY id DESC
        const result = await pool.request().query('SELECT * FROM tbl_products ORDER BY id DESC');
        return result.recordset.map(row => new Product(
            row.id.trim(), row.name, row.sell_price, row.quantityInStock,
            row.newest_import_price, row.description, row.image_url
        ));
    }

    async getProduct(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Char(10), id)
                .query('SELECT * FROM tbl_products WHERE TRIM(id) = TRIM(@id)');

            if (result.recordset.length > 0) {
                const row = result.recordset[0];
                return new Product(
                    row.id.trim(), row.name, row.sell_price, row.quantityInStock,
                    row.newest_import_price, row.description, row.image_url
                );
            }
            return null;
        } catch (err) {
            console.error("Lỗi getProduct DAO:", err);
            throw err;
        }
    }

    async changeProduct(id, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('name', sql.NVarChar, data.name)
                .input('sell_price', sql.Decimal, data.sell_price)
                .input('quantity', sql.Int, data.quantityInStock)
                .input('desc', sql.NVarChar, data.description || '')
                .input('img', sql.VarChar, data.image_url || '')
                .query(`UPDATE tbl_products SET name=@name, sell_price=@sell_price, 
                        quantityInStock=@quantity, description=@desc, image_url=@img WHERE id=@id`);
            return true;
        } catch (err) { return false; }
    }

    async addProduct(data) {
        try {
            const pool = await poolPromise;
            const nextId = await this.generateNextId('tbl_products', 'PROD');
            await pool.request()
                .input('id', sql.VarChar, nextId)
                .input('name', sql.NVarChar, data.name)
                .input('sell_price', sql.Decimal, data.sell_price)
                .input('quantity', sql.Int, data.quantityInStock)
                .input('import_price', sql.Decimal, data.newest_import_price || 0)
                .input('desc', sql.NVarChar, data.description || '')
                .input('img', sql.VarChar, data.image_url || '')
                .query(`INSERT INTO tbl_products (id, name, sell_price, quantityInStock, newest_import_price, description, image_url) 
                        VALUES (@id, @name, @sell_price, @quantity, @import_price, @desc, @img)`);
            return true;
        } catch (err) { return false; }
    }

    async deleteProduct(id) {
        try {
            const pool = await poolPromise;
            await pool.request().input('id', sql.VarChar, id).query('DELETE FROM tbl_products WHERE id = @id');
            return true;
        } catch (err) { return false; }
    }

    // 2. Lấy sản phẩm theo danh mục - MỚI NHẤT Ở ĐẦU
    async getProductsByCategory(categoryId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('categoryId', sql.VarChar, categoryId)
                .query(`
                SELECT p.* FROM tbl_products p
                JOIN tbl_product_categories pc ON p.id = pc.tbl_productsid
                WHERE pc.tbl_categoriesid = @categoryId
                ORDER BY p.id DESC
            `); // Thêm ORDER BY
            return result.recordset.map(row => new Product(
                row.id.trim(), row.name, row.sell_price, row.quantityInStock,
                row.newest_import_price, row.description, row.image_url
            ));
        } catch (err) {
            console.error("Lỗi getProductsByCategory:", err);
            return [];
        }
    }

    async getFilteredProducts(categoryId, minPrice, maxPrice) {
        try {
            const pool = await poolPromise;
            let query = `SELECT p.* FROM tbl_products p`;
            const request = pool.request();

            if (categoryId) {
                query += ` JOIN tbl_product_categories pc ON p.id = pc.tbl_productsid 
                           WHERE pc.tbl_categoriesid = @catId`;
                request.input('catId', sql.Char(10), categoryId);
            } else {
                query += ` WHERE 1=1`;
            }

            if (minPrice !== undefined && minPrice !== null) {
                query += ` AND p.sell_price >= @minPrice`;
                request.input('minPrice', sql.Float, minPrice);
            }

            if (maxPrice !== undefined && maxPrice !== null) {
                query += ` AND p.sell_price <= @maxPrice`;
                request.input('maxPrice', sql.Float, maxPrice);
            }

            // Sắp xếp theo giá hoặc ID mới nhất (Ở đây tôi giữ theo yêu cầu "mới nhất" của bạn)
            query += ` ORDER BY p.id DESC`;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error("Lỗi getFilteredProducts:", err);
            return [];
        }
    }

    // 3. Tìm kiếm sản phẩm - MỚI NHẤT Ở ĐẦU
    async searchProducts(keyword) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('keyword', sql.NVarChar, `%${keyword}%`)
                .query(`SELECT * FROM tbl_products WHERE name LIKE @keyword ORDER BY id DESC`); // Thêm ORDER BY

            return result.recordset.map(row => new Product(
                row.id.trim(), row.name, row.sell_price, row.quantityInStock,
                row.newest_import_price, row.description, row.image_url
            ));
        } catch (err) {
            console.error("Lỗi searchProducts DAO:", err);
            throw err;
        }
    }
}

module.exports = new ProductManageDAO();