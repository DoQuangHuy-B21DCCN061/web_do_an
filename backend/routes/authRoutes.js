const express = require('express');
const router = express.Router();
const { loginAction } = require('../controllers/authController');

router.post('/login', loginAction);

module.exports = router;