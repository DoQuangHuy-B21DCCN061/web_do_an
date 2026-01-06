const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// --- ROUTES DÀNH CHO ADMIN ---
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.put('/:id/status', reviewController.updateReviewStatus);

// --- ROUTES DÀNH CHO KHÁCH HÀNG ---
router.get('/user/:userId', reviewController.getPersonalReviews);
router.post('/change-review', reviewController.updateReview);

module.exports = router;