const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Routes Admin
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);

// Routes Khách hàng
router.post('/place', orderController.placeOrder);

router.get('/user/:userId', orderController.getPersonalOrders);
router.post('/cancel', orderController.cancelPersonalOrder);


module.exports = router;