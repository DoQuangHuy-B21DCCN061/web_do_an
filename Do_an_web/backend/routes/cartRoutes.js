const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Lấy giỏ hàng: GET /api/cart/:userId
router.get('/:userId', cartController.getCart);

// Cập nhật/Thêm item: POST /api/cart/sync
router.post('/sync', cartController.syncItem);

// Gộp giỏ hàng khi đăng nhập: POST /api/cart/merge
router.post('/merge', cartController.mergeCart);

module.exports = router;