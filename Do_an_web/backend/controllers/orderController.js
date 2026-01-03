const OrderManageDAO = require('../dao/OrderManageDAO');

module.exports = {
    // --- DÀNH CHO ADMIN ---
    getOrders: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const data = await OrderManageDAO.getAllOrderPaging(page, limit, search);
            res.json(data);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getOrderById: async (req, res) => {
        const data = await OrderManageDAO.getOrder(req.params.id);
        res.json(data);
    },

    updateOrder: async (req, res) => {
        const success = await OrderManageDAO.changeOrder(req.params.id, req.body);
        if (success) res.json({ success: true });
        else res.json({ success: false, message: "Cập nhật thất bại" });
    },

    // --- DÀNH CHO KHÁCH HÀNG ---
    getPersonalOrders: async (req, res) => {
        try {
            const { userId } = req.params;
            const orders = await OrderManageDAO.getOrdersByUserId(userId);
            res.status(200).json({ success: true, orders });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    placeOrder: async (req, res) => {
        try {
            // Nếu thanh toán VNPay thì trả về flag cho FE tiếp tục flow thanh toán, chưa tạo đơn ở đây
            if (req.body.paymentMethod === 'VNPay' || req.body.paymentMethod === 'VNPAY') {
                // Trả về hướng dẫn cho Frontend gọi /api/vnpay/create_payment_url
                return res.status(200).json({ vnpay: true, message: 'Vui lòng thanh toán qua VNPay.' });
            } else if (req.body.paymentMethod === 'COD') {
                // Đặt đơn và tạo bill luôn
                const result = await OrderManageDAO.placeOrder(req.body);
                return res.status(result.success ? 200 : 400).json(result);
            } else {
                // Trường hợp không xác định
                return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi đặt hàng" });
        }
    },

    cancelPersonalOrder: async (req, res) => {
        try {
            const { id } = req.body;
            const result = await OrderManageDAO.cancelOrder(id);
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy đơn" });
        }
    }
};