const OrderManageDAO = require('../dao/OrderManageDAO');

module.exports = {
    // --- DÀNH CHO ADMIN ---
    getOrders: async (req, res) => {
        const data = await OrderManageDAO.getAllOrder();
        res.json(data);
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
            const result = await OrderManageDAO.placeOrder(req.body);
            res.status(result.success ? 200 : 400).json(result);
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