// backend/controllers/productController.js
const ProductManageDAO = require('../dao/ProductManageDAO');
const path = require('path');
const fs = require('fs');

const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json([]); // Trả về mảng rỗng nếu không có từ khóa

        const products = await ProductManageDAO.searchProducts(q);

        // Trả về trực tiếp mảng sản phẩm để Frontend dùng .map() được ngay
        res.status(200).json(products);
    } catch (err) {
        console.error("Lỗi Controller Search:", err);
        res.status(500).json({ message: "Lỗi tìm kiếm sản phẩm" });
    }
};

const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const result = await ProductManageDAO.getProductsPaging(page, limit, search);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
const updateProduct = async (req, res) => {
    try {
        // Parse categories và suppliers từ FormData
        // Multer có thể parse array thành nhiều keys như 'categories[]', hoặc object
        let categories = [];
        let suppliers = [];
        
        // Debug: Log toàn bộ body để xem dữ liệu nhận được
        console.log("Body keys:", Object.keys(req.body));
        console.log("Full body:", JSON.stringify(req.body, null, 2));
        
        // Xử lý categories - kiểm tra nhiều format
        if (Array.isArray(req.body.categories)) {
            categories = req.body.categories;
        } else if (req.body.categories) {
            categories = [req.body.categories];
        } else if (Array.isArray(req.body['categories[]'])) {
            categories = req.body['categories[]'];
        } else if (req.body['categories[]']) {
            categories = [req.body['categories[]']];
        } else {
            // Tìm tất cả keys có pattern categories[]
            const catKeys = Object.keys(req.body).filter(key => key.startsWith('categories'));
            if (catKeys.length > 0) {
                categories = catKeys.map(key => req.body[key]).filter(val => val);
            }
        }
        
        // Xử lý suppliers - kiểm tra nhiều format
        if (Array.isArray(req.body.suppliers)) {
            suppliers = req.body.suppliers;
        } else if (req.body.suppliers) {
            suppliers = [req.body.suppliers];
        } else if (Array.isArray(req.body['suppliers[]'])) {
            suppliers = req.body['suppliers[]'];
        } else if (req.body['suppliers[]']) {
            suppliers = [req.body['suppliers[]']];
        } else {
            // Tìm tất cả keys có pattern suppliers[]
            const supKeys = Object.keys(req.body).filter(key => key.startsWith('suppliers'));
            if (supKeys.length > 0) {
                suppliers = supKeys.map(key => req.body[key]).filter(val => val);
            }
        }
        
        console.log("Parsed categories:", categories);
        console.log("Parsed suppliers:", suppliers);
        
        // Kiểm tra tên sản phẩm trùng (trừ sản phẩm hiện tại)
        const isDuplicate = await ProductManageDAO.checkDuplicateName(req.body.name, req.params.id);
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: 'Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.' });
        }

        const productData = {
            name: req.body.name,
            sell_price: req.body.sell_price,
            quantityInStock: req.body.quantityInStock,
            description: req.body.description || ''
        };
        
        // Nếu có file ảnh mới được upload
        if (req.file) {
            const imageUrl = `/uploads/products/${req.file.filename}`;
            productData.image_url = imageUrl;
            
            // Xóa ảnh cũ nếu có
            if (req.body.old_image_url && req.body.old_image_url.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', req.body.old_image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } else if (req.body.old_image_url) {
            // Nếu không có ảnh mới, giữ nguyên ảnh cũ
            productData.image_url = req.body.old_image_url;
        }
        
        const success = await ProductManageDAO.changeProduct(req.params.id, productData);
        
        // Cập nhật quan hệ với categories
        const catResult = await ProductManageDAO.updateProductCategories(req.params.id, categories);
        console.log("Update categories result:", catResult);
        
        // Cập nhật quan hệ với suppliers
        const supResult = await ProductManageDAO.updateProductSuppliers(req.params.id, suppliers);
        console.log("Update suppliers result:", supResult);
        
        if (!supResult) {
            return res.status(500).json({ success: false, message: 'Không thể cập nhật nhà cung cấp. Vui lòng kiểm tra bảng tbl_product_suppliers có tồn tại không.' });
        }
        
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createProduct = async (req, res) => {
    try {
        // Parse categories và suppliers từ FormData
        // Multer có thể parse array thành nhiều keys như 'categories[]', hoặc object
        let categories = [];
        let suppliers = [];
        
        // Debug: Log toàn bộ body để xem dữ liệu nhận được
        console.log("Create Product - Body keys:", Object.keys(req.body));
        console.log("Create Product - Full body:", JSON.stringify(req.body, null, 2));
        
        // Xử lý categories - kiểm tra nhiều format
        if (Array.isArray(req.body.categories)) {
            categories = req.body.categories;
        } else if (req.body.categories) {
            categories = [req.body.categories];
        } else if (Array.isArray(req.body['categories[]'])) {
            categories = req.body['categories[]'];
        } else if (req.body['categories[]']) {
            categories = [req.body['categories[]']];
        } else {
            // Tìm tất cả keys có pattern categories[]
            const catKeys = Object.keys(req.body).filter(key => key.startsWith('categories'));
            if (catKeys.length > 0) {
                categories = catKeys.map(key => req.body[key]).filter(val => val);
            }
        }
        
        // Xử lý suppliers - kiểm tra nhiều format
        if (Array.isArray(req.body.suppliers)) {
            suppliers = req.body.suppliers;
        } else if (req.body.suppliers) {
            suppliers = [req.body.suppliers];
        } else if (Array.isArray(req.body['suppliers[]'])) {
            suppliers = req.body['suppliers[]'];
        } else if (req.body['suppliers[]']) {
            suppliers = [req.body['suppliers[]']];
        } else {
            // Tìm tất cả keys có pattern suppliers[]
            const supKeys = Object.keys(req.body).filter(key => key.startsWith('suppliers'));
            if (supKeys.length > 0) {
                suppliers = supKeys.map(key => req.body[key]).filter(val => val);
            }
        }
        
        console.log("Create Product - Parsed categories:", categories);
        console.log("Create Product - Parsed suppliers:", suppliers);
        
        // Kiểm tra tên sản phẩm trùng
        const isDuplicate = await ProductManageDAO.checkDuplicateName(req.body.name);
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: 'Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.' });
        }

        const productData = {
            name: req.body.name,
            sell_price: req.body.sell_price,
            quantityInStock: req.body.quantityInStock,
            description: req.body.description || ''
        };
        
        // Nếu có file ảnh được upload
        if (req.file) {
            productData.image_url = `/uploads/products/${req.file.filename}`;
        }
        
        const success = await ProductManageDAO.addProduct(productData);
        
        // Lấy ID sản phẩm vừa tạo
        if (success) {
            // Lấy sản phẩm vừa tạo để lấy ID
            const products = await ProductManageDAO.getAllProduct();
            const newProduct = products.find(p => p.name === req.body.name);
            
            if (newProduct) {
                // Cập nhật quan hệ với categories
                const catResult = await ProductManageDAO.updateProductCategories(newProduct.id, categories);
                console.log("Create Product - Update categories result:", catResult);
                
                // Cập nhật quan hệ với suppliers
                const supResult = await ProductManageDAO.updateProductSuppliers(newProduct.id, suppliers);
                console.log("Create Product - Update suppliers result:", supResult);
                
                if (!supResult) {
                    return res.status(500).json({ success: false, message: 'Không thể cập nhật nhà cung cấp. Vui lòng kiểm tra bảng tbl_product_suppliers có tồn tại không.' });
                }
            }
        }
        
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const removeProduct = async (req, res) => {
    const success = await ProductManageDAO.deleteProduct(req.params.id);
    res.json({ success });
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductManageDAO.getProduct(id);
        if (product) {
            // Lấy danh sách categories và suppliers
            const categories = await ProductManageDAO.getProductCategories(id);
            const suppliers = await ProductManageDAO.getProductSuppliers(id);
            
            res.status(200).json({
                ...product,
                categories: categories,
                suppliers: suppliers
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

const importProduct = async (req, res) => {
    try {
        const { productId, supplierId, quantity, importPrice } = req.body;

        // Validation
        if (!productId || !supplierId || !quantity || !importPrice) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (parseInt(quantity) <= 0 || parseFloat(importPrice) <= 0) {
            return res.status(400).json({ success: false, message: 'Số lượng và giá nhập phải lớn hơn 0!' });
        }

        const success = await ProductManageDAO.importProduct(
            productId,
            supplierId,
            parseInt(quantity),
            parseFloat(importPrice)
        );

        if (success) {
            res.json({ success: true, message: 'Nhập sản phẩm thành công!' });
        } else {
            res.status(500).json({ success: false, message: 'Nhập sản phẩm thất bại!' });
        }
    } catch (err) {
        console.error("Lỗi importProduct Controller:", err);
        res.status(500).json({ success: false, message: err.message || 'Lỗi hệ thống' });
    }
};

const getImportHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await ProductManageDAO.getImportHistory(page, limit);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error("Lỗi getImportHistory Controller:", err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = { getProducts, updateProduct, createProduct, removeProduct, getProductById, searchProducts, importProduct, getImportHistory };