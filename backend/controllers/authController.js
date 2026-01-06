const LoginDAO = require('../dao/LoginDAO');
const SignInDAO = require('../dao/SignInDAO');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ... (các phần import giữ nguyên)

const loginAction = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Tìm user (Bây giờ DAO chỉ check username)
        const user = await LoginDAO.accountCheck(username);

        if (!user) {
            return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
        }

        // 2. Lấy mật khẩu từ đối tượng user và xóa khoảng trắng thừa (do kiểu CHAR trong SQL)
        const dbPassword = user.password_hash ? user.password_hash.trim() : "";
        let isLoginValid = false;

        // --- KIỂM TRA LỚP 1: So sánh trực tiếp ---
        if (password === dbPassword) {
            isLoginValid = true;
            console.log("Đăng nhập bằng mật khẩu thường thành công");
        }

        // --- KIỂM TRA LỚP 2: Kiểm tra bằng Bcrypt ---
        if (!isLoginValid) {
            try {
                const isMatchBcrypt = await bcrypt.compare(password, dbPassword);
                if (isMatchBcrypt) {
                    isLoginValid = true;
                    console.log("Đăng nhập bằng Bcrypt thành công");
                }
            } catch (bcryptErr) {
                console.log("Dữ liệu không phải định dạng Bcrypt");
            }
        }

        if (!isLoginValid) {
            return res.status(401).json({ success: false, message: "Mật khẩu không chính xác" });
        }

        // 3. Tạo JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            'YOUR_SECRET_KEY',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            user: {
                id: user.id.trim(),
                username: user.username.trim(),
                role: user.role.trim(),
                name: user.name
            }
        });

    } catch (err) {
        console.error("Lỗi Login:", err);
        res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
};


// Hàm đăng ký
const signUpAction = async (req, res) => {
    try {
        const { username, password, name, phone, email } = req.body;

        // 1. Kiểm tra trùng
        const isExist = await SignInDAO.userExist(username, email);
        if (isExist) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập hoặc Email đã tồn tại!" });
        }

        // 2. Tạo đối tượng User
        const newUser = new User();
        newUser.username = username;
        newUser.password_hash = password; // Tạm thời để plain text theo code cũ của bạn
        newUser.name = name;
        newUser.phone = phone;
        newUser.email = email;

        // 3. Lưu vào DB
        const success = await SignInDAO.getNewUser(newUser);
        if (success) {
            return res.status(201).json({ success: true, message: "Đăng ký thành công!" });
        } else {
            return res.status(500).json({ success: false, message: "Lỗi DB: Không thể lưu user!" });
        }
    } catch (err) {
        console.error("Lỗi Controller Register:", err);
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

// Export rõ ràng
module.exports = { loginAction, signUpAction };