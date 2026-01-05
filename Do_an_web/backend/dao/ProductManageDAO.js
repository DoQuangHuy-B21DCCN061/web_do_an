// backend/dao/ProductManageDAO.js
const { sql, poolPromise } = require('../config/db');
const Product = require('../models/Product');
const { generateNextId } = require('../utils/idGenerator');

class ProductManageDAO {
    async getProductsPaging(page = 1, limit = 10, search = '') {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM tbl_products';
        let countQuery = 'SELECT COUNT(*) as total FROM tbl_products';
        const request = pool.request();
        const countRequest = pool.request();
        
        if (search && search.trim()) {
            query += ' WHERE name LIKE @search';
            countQuery += ' WHERE name LIKE @search';
            request.input('search', sql.NVarChar(200), `%${search.trim()}%`);
            countRequest.input('search', sql.NVarChar(200), `%${search.trim()}%`);
        }
        
        query += ' ORDER BY name ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        const products = await request.query(query);
        const totalRes = await countRequest.query(countQuery);
        const total = totalRes.recordset[0] ? parseInt(totalRes.recordset[0].total) : 0;
        
        return {
            products: products.recordset.map(row => new Product(row.id, row.name, row.sell_price, row.quantityInStock, row.newest_import_price, row.description, row.image_url)),
            total
        };
    }

    async getAllProduct(search = '') {
        const pool = await poolPromise;
        let query = 'SELECT * FROM tbl_products';
        const request = pool.request();
        
        if (search && search.trim()) {
            query += ' WHERE name LIKE @search';
            request.input('search', sql.NVarChar(200), `%${search.trim()}%`);
        }
        
        const result = await request.query(query);
        return result.recordset.map(row => new Product(row.id, row.name, row.sell_price, row.quantityInStock, row.newest_import_price, row.description, row.image_url));
    }

    // backend/dao/ProductManageDAO.js
    async getProduct(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Char(10), id) // Đảm bảo đúng kiểu Char(10)
                .query('SELECT * FROM tbl_products WHERE TRIM(id) = TRIM(@id)');

            if (result.recordset.length > 0) {
                const row = result.recordset[0];
                // Trả về đối tượng Product đã được chuẩn hóa
                return new Product(
                    row.id.trim(),
                    row.name,
                    row.sell_price,
                    row.quantityInStock,
                    row.newest_import_price,
                    row.description,
                    row.image_url
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
            return true; // Trả về return(true) khi hợp lệ
        } catch (err) { return false; } // Trả về return(false)
    }

    async addProduct(data) {
        try {
            const pool = await poolPromise;
            const nextId = await generateNextId('tbl_products');
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
    async getProductsByCategory(categoryId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('categoryId', sql.VarChar, categoryId)
                .query(`
                SELECT p.* FROM tbl_products p
                JOIN tbl_product_categories pc ON p.id = pc.tbl_productsid
                WHERE pc.tbl_categoriesid = @categoryId
            `);
            return result.recordset.map(row => new Product(
                row.id, row.name, row.sell_price, row.quantityInStock,
                row.newest_import_price, row.description, row.image_url
            ));
        } catch (err) {
            console.error("Lỗi getProductsByCategory:", err);
            return [];
        }
    }
    // backend/dao/ProductManageDAO.js
    async getFilteredProducts(categoryId, minPrice, maxPrice) {
        try {
            const pool = await poolPromise;
            let query = `SELECT p.* FROM tbl_products p`;
            const request = pool.request();

            // 1. Xử lý Join nếu có lọc theo danh mục
            if (categoryId) {
                query += ` JOIN tbl_product_categories pc ON p.id = pc.tbl_productsid 
                       WHERE pc.tbl_categoriesid = @catId`;
                request.input('catId', sql.Char(10), categoryId);
            } else {
                query += ` WHERE 1=1`; // Điều kiện giả để nối chuỗi tiếp theo
            }

            // 2. Xử lý lọc theo mức giá tối thiểu
            if (minPrice !== undefined && minPrice !== null) {
                query += ` AND p.sell_price >= @minPrice`;
                request.input('minPrice', sql.Float, minPrice);
            }

            // 3. Xử lý lọc theo mức giá tối đa (nếu có)
            if (maxPrice !== undefined && maxPrice !== null) {
                query += ` AND p.sell_price <= @maxPrice`;
                request.input('maxPrice', sql.Float, maxPrice);
            }

            query += ` ORDER BY p.sell_price ASC`;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error("Lỗi getFilteredProducts:", err);
            return [];
        }
    }

    async searchProducts(keyword) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('keyword', sql.NVarChar, `%${keyword}%`) // Tìm kiếm theo tên có chứa từ khóa
                .query(`SELECT * FROM tbl_products WHERE name LIKE @keyword`);

            return result.recordset.map(row => new Product(
                row.id.trim(), // Xử lý khoảng trắng nếu dùng CHAR(10)
                row.name,
                row.sell_price,
                row.quantityInStock,
                row.newest_import_price,
                row.description,
                row.image_url
            ));
        } catch (err) {
            console.error("Lỗi searchProducts DAO:", err);
            throw err;
        }
    }

    // Kiểm tra tên sản phẩm trùng
    async checkDuplicateName(name, excludeId = null) {
        try {
            const pool = await poolPromise;
            let query = `SELECT COUNT(*) as count FROM tbl_products WHERE LOWER(TRIM(name)) = LOWER(TRIM(@name))`;
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

    // Lấy danh sách categories của sản phẩm
    async getProductCategories(productId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('productId', sql.VarChar, productId)
                .query(`SELECT tbl_categoriesid as id FROM tbl_product_categories WHERE tbl_productsid = @productId`);
            return result.recordset.map(r => r.id);
        } catch (err) {
            console.error("Lỗi getProductCategories:", err);
            return [];
        }
    }

    // Lấy danh sách suppliers của sản phẩm
    async getProductSuppliers(productId) {
        try {
            const pool = await poolPromise;
            // Luôn ưu tiên lấy từ bảng tbl_product_suppliers!
            const result = await pool.request()
                .input('productId', sql.VarChar, productId)
                .query(`SELECT tbl_suppliersid as id FROM tbl_product_suppliers WHERE tbl_productsid = @productId`);
            return result.recordset.map(r => typeof r.id === 'string' ? r.id.trim() : String(r.id).trim());
        } catch (err) {
            console.error("Lỗi getProductSuppliers:", err);
            return [];
        }
    }

    // Cập nhật quan hệ product-categories
    async updateProductCategories(productId, categoryIds) {
        try {
            const pool = await poolPromise;
            
            // Tạo tất cả ID trước khi bắt đầu transaction để tránh timeout
            let ids = [];
            if (categoryIds && categoryIds.length > 0) {
                // Tạo tất cả ID cùng lúc
                ids = await generateNextId('tbl_product_categories', categoryIds.length);
                // Đảm bảo ids là mảng
                if (!Array.isArray(ids)) {
                    ids = [ids];
                }
            }

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Xóa tất cả quan hệ cũ
                await transaction.request()
                    .input('productId', sql.VarChar, productId)
                    .query(`DELETE FROM tbl_product_categories WHERE tbl_productsid = @productId`);

                // Thêm quan hệ mới với ID đã tạo sẵn
                if (categoryIds && categoryIds.length > 0) {
                    for (let i = 0; i < categoryIds.length; i++) {
                        await transaction.request()
                            .input('id', sql.Char(10), ids[i])
                            .input('productId', sql.VarChar, productId)
                            .input('categoryId', sql.VarChar, categoryIds[i])
                            .query(`INSERT INTO tbl_product_categories (id, tbl_productsid, tbl_categoriesid) VALUES (@id, @productId, @categoryId)`);
                    }
                }

                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error("Lỗi updateProductCategories:", err);
            return false;
        }
    }

    // Cập nhật quan hệ product-suppliers
    async updateProductSuppliers(productId, supplierIds) {
        try {
            const pool = await poolPromise;
            
            // Kiểm tra xem bảng tbl_product_suppliers có tồn tại không
            let tableExists = false;
            try {
                await pool.request().query(`SELECT TOP 1 * FROM tbl_product_suppliers`);
                tableExists = true;
            } catch (err) {
                // Bảng không tồn tại
                tableExists = false;
                console.error("Bảng tbl_product_suppliers chưa tồn tại. Vui lòng chạy script SQL: backend/database/create_product_suppliers_table.sql");
            }

            if (!tableExists) {
                // Nếu bảng không tồn tại, thử tự động tạo bảng
                try {
                    await pool.request().query(`
                        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tbl_product_suppliers' and xtype='U')
                        BEGIN
                            CREATE TABLE tbl_product_suppliers (
                                id CHAR(10) PRIMARY KEY,
                                tbl_productsid CHAR(50) NOT NULL,
                                tbl_suppliersid CHAR(10) NOT NULL,
                                CONSTRAINT FK_ProdSupp_Products FOREIGN KEY (tbl_productsid) REFERENCES tbl_products(id) ON DELETE CASCADE,
                                CONSTRAINT FK_ProdSupp_Suppliers FOREIGN KEY (tbl_suppliersid) REFERENCES tbl_suppliers(id) ON DELETE CASCADE
                            );
                        END
                    `);
                    tableExists = true;
                    console.log("Đã tự động tạo bảng tbl_product_suppliers");
                } catch (createErr) {
                    console.error("Không thể tự động tạo bảng tbl_product_suppliers:", createErr.message);
                    return false;
                }
            }

            // Tạo tất cả ID trước khi bắt đầu transaction để tránh timeout
            let ids = [];
            if (supplierIds && supplierIds.length > 0) {
                // Tạo tất cả ID cùng lúc
                ids = await generateNextId('tbl_product_suppliers', supplierIds.length);
                // Đảm bảo ids là mảng
                if (!Array.isArray(ids)) {
                    ids = [ids];
                }
            }

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Xóa tất cả quan hệ cũ
                await transaction.request()
                    .input('productId', sql.VarChar, productId)
                    .query(`DELETE FROM tbl_product_suppliers WHERE tbl_productsid = @productId`);

                // Thêm quan hệ mới với ID đã tạo sẵn
                if (supplierIds && supplierIds.length > 0) {
                    for (let i = 0; i < supplierIds.length; i++) {
                        await transaction.request()
                            .input('id', sql.Char(10), ids[i])
                            .input('productId', sql.VarChar, productId)
                            .input('supplierId', sql.VarChar, supplierIds[i])
                            .query(`INSERT INTO tbl_product_suppliers (id, tbl_productsid, tbl_suppliersid) VALUES (@id, @productId, @supplierId)`);
                    }
                }

                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error("Lỗi updateProductSuppliers:", err);
            return false;
        }
    }

    // Nhập sản phẩm - lưu vào tbl_import_products và cập nhật tbl_products
    async importProduct(productId, supplierId, quantity, importPrice) {
        try {
            const pool = await poolPromise;
            
            // 1. Tạo ID mới cho bản ghi nhập (trước khi bắt đầu transaction)
            const importId = await generateNextId('tbl_import_products');
            
            // 2. Lấy ngày hiện tại
            const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                
                // 3. Thêm bản ghi vào tbl_import_products
                await transaction.request()
                    .input('id', sql.Char(10), importId)
                    .input('import_date', sql.Date, currentDate)
                    .input('import_price', sql.Float, importPrice)
                    .input('quantity', sql.Int, quantity)
                    .input('supplierId', sql.Char(10), supplierId)
                    .input('productId', sql.VarChar, productId)
                    .query(`INSERT INTO tbl_import_products (id, import_date, import_price, quantity, tbl_suppliersid, tbl_productsid) 
                            VALUES (@id, @import_date, @import_price, @quantity, @supplierId, @productId)`);

                // 4. Cập nhật newest_import_price và quantityInStock trong tbl_products
                // Lấy số lượng hiện tại
                const currentProduct = await transaction.request()
                    .input('productId', sql.VarChar, productId)
                    .query('SELECT quantityInStock FROM tbl_products WHERE id = @productId');
                
                if (currentProduct.recordset.length === 0) {
                    throw new Error('Không tìm thấy sản phẩm');
                }

                const currentQuantity = currentProduct.recordset[0].quantityInStock || 0;
                const newQuantity = currentQuantity + quantity;

                // Cập nhật newest_import_price và quantityInStock
                await transaction.request()
                    .input('productId', sql.VarChar, productId)
                    .input('newest_import_price', sql.Float, importPrice)
                    .input('newQuantity', sql.Int, newQuantity)
                    .query(`UPDATE tbl_products 
                            SET newest_import_price = @newest_import_price, 
                                quantityInStock = @newQuantity 
                            WHERE id = @productId`);

                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error("Lỗi importProduct DAO:", err);
            return false;
        }
    }

    // Lấy lịch sử nhập sản phẩm với phân trang
    async getImportHistory(page = 1, limit = 10) {
        try {
            const pool = await poolPromise;
            const offset = (page - 1) * limit;
            
            // Query để lấy dữ liệu với JOIN để lấy tên sản phẩm và nhà cung cấp
            const query = `
                SELECT 
                    ip.id,
                    ip.import_date,
                    ip.import_price,
                    ip.quantity,
                    ip.tbl_productsid as product_id,
                    ip.tbl_suppliersid as supplier_id,
                    p.name as product_name,
                    s.name as supplier_name
                FROM tbl_import_products ip
                LEFT JOIN tbl_products p ON ip.tbl_productsid = p.id
                LEFT JOIN tbl_suppliers s ON ip.tbl_suppliersid = s.id
                ORDER BY ip.import_date DESC, ip.id DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;
            
            const countQuery = `SELECT COUNT(*) as total FROM tbl_import_products`;
            
            const request = pool.request();
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limit);
            
            const result = await request.query(query);
            const countResult = await pool.request().query(countQuery);
            const total = countResult.recordset[0] ? parseInt(countResult.recordset[0].total) : 0;
            
            return {
                imports: result.recordset.map(row => ({
                    id: row.id,
                    import_date: row.import_date,
                    import_price: row.import_price,
                    quantity: row.quantity,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    supplier_id: row.supplier_id,
                    supplier_name: row.supplier_name
                })),
                total
            };
        } catch (err) {
            console.error("Lỗi getImportHistory DAO:", err);
            return { imports: [], total: 0 };
        }
    }
}

module.exports = new ProductManageDAO();