const ReviewManagerDAO = require('../dao/ReviewManagerDAO');

const reviewController = {
    // Admin: Lấy theo sản phẩm
    getReviewsByProduct: async (req, res) => {
        try {
            const { productId } = req.params;
            const reviews = await ReviewManagerDAO.getAllReview(productId);
            res.status(200).json({ success: true, reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" });
        }
    },

    // Khách hàng: Lấy theo cá nhân
    getPersonalReviews: async (req, res) => {
        try {
            const data = await ReviewManagerDAO.getReviewsByUserId(req.params.userId);
            res.json({ success: true, reviews: data });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi lấy đánh giá cá nhân" });
        }
    },

    // Khách hàng: Cập nhật nội dung
    updateReview: async (req, res) => {
        try {
            const { id, rating, comment } = req.body;
            const result = await ReviewManagerDAO.changeReview(id, { rating, comment });
            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi cập nhật" });
        }
    },

    // Admin: Cập nhật trạng thái hiển thị
    updateReviewStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const success = await ReviewManagerDAO.changeStatus(id, status);

            if (success) {
                res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công!" });
            } else {
                res.status(400).json({ success: false, message: "Cập nhật thất bại!" });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
};

module.exports = reviewController;