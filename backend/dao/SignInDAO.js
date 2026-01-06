const { sql, poolPromise } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
class SignInDAO {
    // Bước 9 & 13: Kiểm tra user đã tồn tại chưa
    async userExist(username, email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.Char, username)
            .input('email', sql.Char, email)
            .query('SELECT id FROM tbl_users WHERE username = @username OR email = @email');

        return result.recordset.length > 0;
    }

    // Bước 21: Tạo user mới
    async getNewUser(userData) {
        try {
            const pool = await poolPromise;
            // Tạo ID thủ công (vì ID là CHAR(10) không tự tăng)
            const id = 'USR' + Date.now().toString().slice(-7);
            const salt = await bcrypt.genSalt(10);
            const hashedPwd = await bcrypt.hash(userData.password_hash, salt);

            await pool.request()
                .input('id', sql.Char, id)
                .input('username', sql.Char, userData.username)
                .input('password', sql.Char, hashedPwd)
                .input('name', sql.NVarChar, userData.name)
                .input('phone', sql.Char, userData.phone)
                .input('email', sql.Char, userData.email)
                .input('role', sql.NVarChar, 'USER') // Mặc định là khách hàng
                .query(`
                    INSERT INTO tbl_users (id, username, password_hash, role, name, phone, email, status, points)
                    VALUES (@id, @username, @password, @role, @name, @phone, @email, 1, 0)
                `);
            return true;
        } catch (err) {
            console.error("Lỗi SignInDAO:", err.message);
            return false;
        }
    }
}

module.exports = new SignInDAO();