const { sql, poolPromise } = require('../config/db');
const User = require('../models/User');

class LoginDAO {
    // Bước 12, 13: accountCheck()
    async accountCheck(username, password) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user', sql.Char, username)
                .input('pass', sql.Char, password)
                .query('SELECT id, username, role, name FROM tbl_users WHERE username = @user AND password_hash = @pass');

            if (result.recordset.length > 0) {
                const data = result.recordset[0];
                const user = new User();
                user.id = data.id;
                user.username = data.username;
                // Bước 14: set dữ liệu
                user.setName(data.name);
                user.setPosition(data.role);
                return user; // Bước 15: Trả về đối tượng
            }
            return null; // Bước 16: Không hợp lệ
        } catch (err) {
            return null;
        }
    }

    // Bước 21: getUser()
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