// backend/controllers/SupplierManageController.js
const SupplierManageDAO = require('../dao/SupplierManageDAO');

const getAllSuppliers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const result = await SupplierManageDAO.getSuppliersPaging(page, limit, search);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách nhà cung cấp: ' + err.message });
    }
};

const getSupplierById = async (req, res) => {
    const supplier = await SupplierManageDAO.getSupplier(req.params.id);
    res.json(supplier);
};

const updateSupplier = async (req, res) => {
    try {
        // Kiểm tra tên trùng (trừ nhà cung cấp hiện tại)
        const isDuplicateName = await SupplierManageDAO.checkDuplicateName(req.body.name, req.params.id);
        if (isDuplicateName) {
            return res.status(400).json({ success: false, message: 'Tên nhà cung cấp đã tồn tại. Vui lòng chọn tên khác.' });
        }

        // Kiểm tra số điện thoại trùng (trừ nhà cung cấp hiện tại)
        const isDuplicatePhone = await SupplierManageDAO.checkDuplicatePhone(req.body.phone, req.params.id);
        if (isDuplicatePhone) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác.' });
        }

        // Kiểm tra email trùng (nếu có email, trừ nhà cung cấp hiện tại)
        if (req.body.email && req.body.email.trim() !== '') {
            const isDuplicateEmail = await SupplierManageDAO.checkDuplicateEmail(req.body.email, req.params.id);
            if (isDuplicateEmail) {
                return res.status(400).json({ success: false, message: 'Email đã tồn tại. Vui lòng chọn email khác.' });
            }
        }

        const success = await SupplierManageDAO.changeDataSupplier(req.params.id, req.body);
        if (success) {
            res.json({ success: true, message: "Thay đổi thành công" });
        } else {
            res.json({ success: false, message: "Thay đổi thất bại" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

const createSupplier = async (req, res) => {
    try {
        // 1. Lấy thông tin từ body của request
        const supplierData = req.body;

        // 2. Kiểm tra tên trùng
        const isDuplicateName = await SupplierManageDAO.checkDuplicateName(supplierData.name);
        if (isDuplicateName) {
            return res.status(400).json({ success: false, message: 'Tên nhà cung cấp đã tồn tại. Vui lòng chọn tên khác.' });
        }

        // 3. Kiểm tra số điện thoại trùng
        const isDuplicatePhone = await SupplierManageDAO.checkDuplicatePhone(supplierData.phone);
        if (isDuplicatePhone) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác.' });
        }

        // 4. Kiểm tra email trùng (nếu có email)
        if (supplierData.email && supplierData.email.trim() !== '') {
            const isDuplicateEmail = await SupplierManageDAO.checkDuplicateEmail(supplierData.email);
            if (isDuplicateEmail) {
                return res.status(400).json({ success: false, message: 'Email đã tồn tại. Vui lòng chọn email khác.' });
            }
        }

        // 5. Gọi hàm xử lý từ lớp DAO
        const success = await SupplierManageDAO.addSupplier(supplierData);

        // 6. Trả kết quả về cho Frontend
        if (success) {
            res.status(201).json({ success: true, message: "Thêm nhà cung cấp thành công!" });
        } else {
            res.status(400).json({ success: false, message: "Thêm thất bại!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

const removeSupplier = async (req, res) => {
    const success = await SupplierManageDAO.deleteSupplier(req.params.id);
    res.json({ success });
};

module.exports = { getAllSuppliers, getSupplierById, updateSupplier, createSupplier, removeSupplier };