const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Lấy danh sách danh mục (GET)
router.get('/', categoryController.getCategories);

// Lấy chi tiết một danh mục (GET)
router.get('/:id', categoryController.getCategoryById);

// Cập nhật thông tin danh mục (PUT)
router.put('/:id', categoryController.updateCategory);

module.exports = router;