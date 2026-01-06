let express = require('express');
let router = express.Router();
const OrderDetailDAO = require('../dao/OrderDetailDAO');

// Xem chi tiết 1 đơn hàng theo id - cho cả admin và user
router.get('/order/:id/detail', async function (req, res) {
    try {
        const orderId = req.params.id;
        const detail = await OrderDetailDAO.getOrderDetails(orderId);
        if (!detail) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        res.json(detail);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.toString() });
    }
});

module.exports = router;

