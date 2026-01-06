// backend/routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/SupplierManageController');

router.get('/', controller.getAllSuppliers);
router.get('/:id', controller.getSupplierById);
router.put('/:id', controller.updateSupplier);
router.post('/', controller.createSupplier); // Thêm mới
router.delete('/:id', controller.removeSupplier); // Xoá

module.exports = router;