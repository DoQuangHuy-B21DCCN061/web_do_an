const CategoryManageDAO = require('../dao/CategoryManageDAO');

module.exports = {
    getCategories: async (req, res) => {
        const data = await CategoryManageDAO.getAllCategory();
        res.json(data);
    },
    getCategoryById: async (req, res) => {
        const data = await CategoryManageDAO.getCategory(req.params.id);
        res.json(data);
    },
    updateCategory: async (req, res) => {
        const success = await CategoryManageDAO.changeCategory(req.params.id, req.body);
        res.json({ success });
    }
};