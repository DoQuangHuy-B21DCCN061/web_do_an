const StatisticDAO = require('../dao/StatisticDAO');

const statisticController = {
    getRevenueFlex: async (req, res) => {
        const { type, month, year } = req.query;
        const data = await StatisticDAO.getRevenueByFlex(type, parseInt(month), parseInt(year));
        res.json(data);
    },
    getProductsQuantity: async (req, res) => {
        try {
            const { type, month, year } = req.query;
            const data = await StatisticDAO.getProductsQuantityByTime(type, parseInt(month), parseInt(year));
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: "Lỗi thống kê số lượng sản phẩm" });
        }
    },
    getTopCustomers: async (req, res) => {
        const { type, month, year } = req.query;
        const data = await StatisticDAO.getTopCustomers(type, parseInt(month), parseInt(year));
        res.json(data);
    }
};
module.exports = statisticController;