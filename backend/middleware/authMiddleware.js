const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Không tìm thấy Token!" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret_key');
        req.user = decoded; // Lưu thông tin user vào request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này!" });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };