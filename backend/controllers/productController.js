// backend/controllers/productController.js
const ProductManageDAO = require('../dao/ProductManageDAO');

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
        const { categoryId, minPrice, maxPrice } = req.query;
        // Chuyển đổi dữ liệu sang số nếu tồn tại
        const products = await ProductManageDAO.getFilteredProducts(
            categoryId,
            minPrice ? parseFloat(minPrice) : null,
            maxPrice ? parseFloat(maxPrice) : null
        );
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
const updateProduct = async (req, res) => {
    const success = await ProductManageDAO.changeProduct(req.params.id, req.body);
    res.json({ success });
};

const createProduct = async (req, res) => {
    const success = await ProductManageDAO.addProduct(req.body);
    res.json({ success });
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
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

module.exports = { getProducts, updateProduct, createProduct, removeProduct, getProductById, searchProducts };