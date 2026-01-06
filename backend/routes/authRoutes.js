const express = require('express');
const router = express.Router();
const { loginAction, signUpAction } = require('../controllers/authController');

// Đăng nhập
router.post('/login', loginAction);

// Đăng ký 
router.post('/register', signUpAction);

module.exports = router;