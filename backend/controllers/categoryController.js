const CategoryManageDAO = require('../dao/CategoryManageDAO');

module.exports = {
    getCategories: async (req, res) => {
        try {
            const search = req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await CategoryManageDAO.getCategoriesPaging(page, limit, search);
            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi lấy danh sách danh mục: ' + err.message });
        }
    },
    getCategoryById: async (req, res) => {
        const data = await CategoryManageDAO.getCategory(req.params.id);
        res.json(data);
    },
    updateCategory: async (req, res) => {
        try {
            // Kiểm tra tên danh mục trùng (trừ danh mục hiện tại)
            const isDuplicate = await CategoryManageDAO.checkDuplicateName(req.body.name, req.params.id);
            if (isDuplicate) {
                return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại. Vui lòng chọn tên khác.' });
            }

            const success = await CategoryManageDAO.changeCategory(req.params.id, req.body);
            res.json({ success });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + err.message });
        }
    }
};