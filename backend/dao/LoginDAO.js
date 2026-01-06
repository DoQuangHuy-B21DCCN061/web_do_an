const { sql, poolPromise } = require('../config/db');
const User = require('../models/User');

class LoginDAO {
    // Sửa: Chỉ nhận vào username
    async accountCheck(username) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user', sql.Char, username)
                // Lấy thêm password_hash để Controller so sánh
                .query('SELECT id, username, password_hash, role, name FROM tbl_users WHERE username = @user');

            if (result.recordset.length > 0) {
                const data = result.recordset[0];
                const user = new User();
                user.id = data.id;
                user.username = data.username;
                user.password_hash = data.password_hash; // Gán mật khẩu vào đối tượng để controller dùng
                user.setName(data.name);
                user.setPosition(data.role);
                return user;
            }
            return null;
        } catch (err) {
            console.error("Lỗi LoginDAO:", err);
            return null;
        }
    }

    async getUser(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Char, id)
            .query('SELECT * FROM tbl_users WHERE id = @id');

        if (result.recordset.length > 0) {
            const d = result.recordset[0];
            return new User(d.id, d.username, d.role, d.name);
        }
        return null;
    }
}

module.exports = new LoginDAO();