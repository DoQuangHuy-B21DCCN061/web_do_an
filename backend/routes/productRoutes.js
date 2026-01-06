// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const upload = require('../middleware/upload');

router.post('/', upload.single('image'), controller.createProduct);
router.post('/import', controller.importProduct);  // Route nhập sản phẩm - phải đặt trước /:id
router.get('/import/history', controller.getImportHistory);  // Route lịch sử nhập - phải đặt trước /:id
router.put('/:id', upload.single('image'), controller.updateProduct);
router.delete('/:id', controller.removeProduct);
router.get('/search', controller.searchProducts);
router.get('/:id', controller.getProductById);   // Lấy chi tiết theo ID
router.get('/', controller.getProducts);          // Lấy tất cả/lọc
module.exports = router;