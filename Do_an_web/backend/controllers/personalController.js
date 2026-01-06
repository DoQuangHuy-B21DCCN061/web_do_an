const PersonalManageDAO = require('../dao/PersonalManageDAO');

const personalController = {
    getUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await PersonalManageDAO.getUserById(id);

            if (user) {
                res.status(200).json({ success: true, user });
            } else {
                res.status(404).json({ success: false, message: "Không tìm thấy người dùng trong hệ thống" });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
        }
    },

    changeInfo: async (req, res) => {
        try {
            const userData = req.body;
            const result = await PersonalManageDAO.changeInfo(userData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: "Cập nhật thông tin thành công!",
                    user: result.user
                });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật" });
        }
    },
    changePassword: async (req, res) => {
        try {
            const { id, oldPassword, newPassword } = req.body;
            const result = await PersonalManageDAO.changePassword(id, oldPassword, newPassword);

            if (result.success) {
                res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
            } else {
                res.status(400).json({ success: false, message: result.message });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống" });
        }
    }
};

module.exports = personalController;