// backend/controllers/authController.js
const LoginDAO = require('../dao/LoginDAO');

const loginAction = async (req, res) => {
    const { username, password } = req.body;
    const user = await LoginDAO.accountCheck(username, password);

    if (!user) {
        return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Bước quan trọng: Trả về role để Frontend biết đường điều hướng
    return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        user: {
            id: user.id,
            username: user.username,
            role: user.role, // 'ADMIN' hoặc 'USER'
            name: user.name
        }
    });
};

module.exports = { loginAction };