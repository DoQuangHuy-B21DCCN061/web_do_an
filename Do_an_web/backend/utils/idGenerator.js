// backend/utils/idGenerator.js
// Utility để tạo ID tự động theo pattern: 3 chữ cái đầu của bảng + số thứ tự từ 100 trở lên

const { sql, poolPromise } = require('../config/db');

/**
 * Lấy 3 chữ cái đầu của tên bảng (bỏ qua prefix "tbl_")
 * @param {string} tableName - Tên bảng (ví dụ: "tbl_users", "tbl_products")
 * @returns {string} - 3 chữ cái đầu in hoa (ví dụ: "USE", "PRO")
 */
function getTablePrefix(tableName) {
    // Bỏ prefix "tbl_" nếu có
    let name = tableName.toLowerCase();
    if (name.startsWith('tbl_')) {
        name = name.substring(4); // Bỏ "tbl_"
    }
    
    // Lấy 3 chữ cái đầu và chuyển thành chữ hoa
    return name.substring(0, 3).toUpperCase();
}

/**
 * Tạo ID tiếp theo cho bảng
 * @param {string} tableName - Tên bảng (ví dụ: "tbl_users", "tbl_products")
 * @param {number} count - Số lượng ID cần tạo (mặc định 1)
 * @returns {Promise<string|string[]>} - ID mới hoặc mảng ID (ví dụ: "USE100" hoặc ["PRO100", "PRO101"])
 */
async function generateNextId(tableName, count = 1) {
    const pool = await poolPromise;
    const prefix = getTablePrefix(tableName);
    
    try {
        // Lấy ID lớn nhất hiện tại - sử dụng cách an toàn hơn
        // Lưu ý: tableName được kiểm soát từ code nên an toàn
        // Tìm kiếm không phân biệt hoa thường để tương thích với dữ liệu cũ
        const request = pool.request();
        request.input('prefix', sql.VarChar, prefix + '%');
        const result = await request.query(`
            SELECT TOP 1 id 
            FROM ${tableName} 
            WHERE UPPER(id) LIKE UPPER(@prefix) 
                AND LEN(id) >= 4
                AND ISNUMERIC(SUBSTRING(id, 4, LEN(id))) = 1
            ORDER BY CAST(SUBSTRING(id, 4, LEN(id)) AS INT) DESC
        `);
        
        let startNumber = 100;
        
        if (result.recordset.length > 0) {
            const lastId = result.recordset[0].id.trim();
            // Lấy phần số từ vị trí thứ 4 (sau 3 chữ cái đầu)
            const lastNumberStr = lastId.substring(3);
            const lastNumber = parseInt(lastNumberStr, 10);
            
            // Nếu số hiện tại >= 100, bắt đầu từ số tiếp theo
            if (!isNaN(lastNumber) && lastNumber >= 100) {
                startNumber = lastNumber + 1;
            }
        }
        
        // Tạo ID hoặc mảng ID
        if (count === 1) {
            return `${prefix}${startNumber}`;
        } else {
            const ids = [];
            for (let i = 0; i < count; i++) {
                ids.push(`${prefix}${startNumber + i}`);
            }
            return ids;
        }
    } catch (err) {
        // Nếu có lỗi (ví dụ: không tìm thấy ID nào phù hợp), bắt đầu từ 100
        console.error(`Lỗi khi tạo ID cho bảng ${tableName}:`, err.message);
        if (count === 1) {
            return `${prefix}100`;
        } else {
            const ids = [];
            for (let i = 0; i < count; i++) {
                ids.push(`${prefix}${100 + i}`);
            }
            return ids;
        }
    }
}

module.exports = {
    generateNextId,
    getTablePrefix
};

