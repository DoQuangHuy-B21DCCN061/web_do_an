// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.removeProduct);
router.get('/search', controller.searchProducts);
router.get('/:id', controller.getProductById);   // Lấy chi tiết theo ID
router.get('/', controller.getProducts);          // Lấy tất cả/lọc
module.exports = router;