const { sql, poolPromise } = require('../config/db');
const User = require('../models/User');

class PersonalManageDAO {
    // backend/dao/PersonalManageDAO.js
    async getUserById(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Char(10), id) // Khớp Schema tbl_users
                .query(`SELECT id, username, name, phone, address, role FROM tbl_users WHERE TRIM(id) = TRIM(@id)`);

            if (result.recordset.length > 0) {
                const row = result.recordset[0];
                const userEntity = new User();

                userEntity.id = row.id.trim();
                userEntity.username = row.username ? row.username.trim() : "";
                userEntity.setName(row.name);
                // Cập nhật đầy đủ SĐT và Địa chỉ để tự điền form
                userEntity.setPhone(row.phone ? row.phone.trim() : "");
                userEntity.setAddress(row.address ? row.address.trim() : "");
                userEntity.role = row.role ? row.role.trim() : "";

                return userEntity;
            }
            return null;
        } catch (error) {
            console.error("Lỗi getUserById:", error);
            throw error;
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const pool = await poolPromise;

            // 1. Kiểm tra mật khẩu cũ (Trong thực tế nên dùng bcrypt để so sánh hash)
            const userCheck = await pool.request()
                .input('id', sql.Char(10), id)
                .query('SELECT password_hash FROM tbl_users WHERE id = @id');

            if (userCheck.recordset.length === 0) return { success: false, message: "Người dùng không tồn tại" };

            const currentHash = userCheck.recordset[0].password_hash.trim();
            if (currentHash !== oldPassword) {
                return { success: false, message: "Mật khẩu cũ không chính xác" };
            }

            // 2. Cập nhật mật khẩu mới
            await pool.request()
                .input('id', sql.Char(10), id)
                .input('newPass', sql.Char(256), newPassword)
                .query('UPDATE tbl_users SET password_hash = @newPass WHERE id = @id');

            return { success: true };
        } catch (error) {
            console.error("DAO Error:", error);
            throw error;
        }
    }

    async changeInfo(data) {
        try {
            const pool = await poolPromise;
            const userEntity = new User();

            userEntity.id = data.id;
            userEntity.setName(data.name);
            userEntity.setPhone(data.phone);
            userEntity.setAddress(data.address);

            await pool.request()
                .input('id', sql.Char(10), userEntity.id)
                .input('name', sql.NVarChar, userEntity.name)
                .input('phone', sql.Char(12), userEntity.phone) // CHAR(12) khớp DB
                .input('address', sql.NVarChar, userEntity.address)
                .query(`UPDATE tbl_users SET name = @name, phone = @phone, address = @address WHERE id = @id`);

            return { success: true, user: userEntity };
        } catch (error) {
            console.error("DAO Error (changeInfo):", error);
            throw error;
        }
    }
}

module.exports = new PersonalManageDAO();