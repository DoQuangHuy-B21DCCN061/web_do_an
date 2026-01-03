const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');

router.get('/revenue', statisticController.getRevenueFlex);

// SỬA TẠI ĐÂY: Đổi getTopSellingProducts thành getProductsQuantity
router.get('/top-selling-products', statisticController.getProductsQuantity);

router.get('/top-customers', statisticController.getTopCustomers);

module.exports = router;