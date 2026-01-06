const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');

router.get('/:id', personalController.getUser); // Route lấy thông tin theo ID
router.post('/change-info', personalController.changeInfo); // Route cập nhật
router.post('/change-password', personalController.changePassword);
module.exports = router;