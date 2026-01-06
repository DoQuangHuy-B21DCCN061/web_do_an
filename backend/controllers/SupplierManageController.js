// backend/controllers/SupplierManageController.js
const SupplierManageDAO = require('../dao/SupplierManageDAO');

const getAllSuppliers = async (req, res) => {
    const suppliers = await SupplierManageDAO.getAllSupplier();
    res.json(suppliers);
};

const getSupplierById = async (req, res) => {
    const supplier = await SupplierManageDAO.getSupplier(req.params.id);
    res.json(supplier);
};

const updateSupplier = async (req, res) => {
    const success = await SupplierManageDAO.changeDataSupplier(req.params.id, req.body);
    if (success) {
        res.json({ success: true, message: "Thay đổi thành công" });
    } else {
        res.json({ success: false, message: "Thay đổi thất bại" });
    }
};

const createSupplier = async (req, res) => {
    // 1. Lấy thông tin từ body của request
    const supplierData = req.body;

    // 2. Gọi hàm xử lý từ lớp DAO
    const success = await SupplierManageDAO.addSupplier(supplierData);

    // 3. Trả kết quả về cho Frontend
    if (success) {
        res.status(201).json({ success: true, message: "Thêm nhà cung cấp thành công!" });
    } else {
        res.status(400).json({ success: false, message: "Thêm thất bại!" });
    }
};

const removeSupplier = async (req, res) => {
    const success = await SupplierManageDAO.deleteSupplier(req.params.id);
    res.json({ success });
};

module.exports = { getAllSuppliers, getSupplierById, updateSupplier, createSupplier, removeSupplier };