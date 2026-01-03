const CustomerManageDAO = require('../dao/CustomerManageDAO');

const { sql, poolPromise } = require('../config/db');

const updateCustomer = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { phone, email } = req.body;
        const id = req.params.id;

                // Kiểm tra định dạng số điện thoại: chỉ 10 chữ số
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Số điện thoại phải có đúng 10 chữ số!' });
        }
        
        // Kiểm tra định dạng email nếu có nhập
        if (email && !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Email phải chứa ký tự "@"!' });
        }
        
        // Kiểm tra trùng số điện thoại (trừ chính mình)
        const checkPhone = await pool.request()
            .input('phone', sql.VarChar, phone)
            .input('id', sql.VarChar, id)
            .query('SELECT id FROM tbl_users WHERE phone = @phone AND id != @id');
        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại!' });
        }

        // Kiểm tra trùng email (trừ chính mình, nếu email có nhập)
        if (email) {
            const checkEmail = await pool.request()
                .input('email', sql.VarChar, email)
                .input('id', sql.VarChar, id)
                .query('SELECT id FROM tbl_users WHERE email = @email AND id != @id');
            if (checkEmail.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
            }
        }

        const success = await CustomerManageDAO.changeCustomer(id, req.body);
        if (success) {
            res.json({ success: true, message: "Thay đổi thành công!" });
        } else {
            res.status(400).json({ success: false, message: "Thay đổi thất bại!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + err.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const data = await CustomerManageDAO.getCustomersPaging(page, limit, search);
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khách hàng: ' + err.message });
    }
};

module.exports = { getCustomers, updateCustomer };