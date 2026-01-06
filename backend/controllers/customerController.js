const CustomerManageDAO = require('../dao/CustomerManageDAO');

const updateCustomer = async (req, res) => {
    // QTV nhấn nút xác nhận -> Gọi hàm changeCustomer trong DAO
    const success = await CustomerManageDAO.changeCustomer(req.params.id, req.body);
    if (success) {
        res.json({ success: true, message: "Thay đổi thành công!" }); // display success
    } else {
        res.status(400).json({ success: false, message: "Thay đổi thất bại!" }); // display fail
    }
};

const getCustomers = async (req, res) => {
    const data = await CustomerManageDAO.getAllCustomer();
    res.json(data);
};

module.exports = { getCustomers, updateCustomer };