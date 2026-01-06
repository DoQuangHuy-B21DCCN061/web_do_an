const CartManageDAO = require('../dao/CartManageDAO');

const cartController = {
    getCart: async (req, res) => {
        try {
            const { userId } = req.params;
            const cart = await CartManageDAO.getCartByUserId(userId);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy dữ liệu giỏ hàng" });
        }
    },

    syncItem: async (req, res) => {
        const { userId, productId, quantity } = req.body;
        const success = await CartManageDAO.syncCartItem(userId, productId, quantity);
        res.json({ success });
    },

    mergeCart: async (req, res) => {
        const { userId, items } = req.body;
        const success = await CartManageDAO.mergeCart(userId, items);
        res.json({ success });
    }
};

module.exports = cartController;