const { sql, poolPromise } = require('../config/db');
const Bill = require('../models/Bill');
const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');
const User = require('../models/User');

class StatisticDAO {
    // 1. Thống kê doanh thu (Đã chạy đúng)
    async getRevenueByFlex(type, month, year, limit = 10) {
        const pool = await poolPromise;
        const query = (type === 'dailyInMonth')
            ? `SELECT id, total_price, bill_date FROM tbl_bills WHERE MONTH(bill_date) = @month AND YEAR(bill_date) = @year`
            : `SELECT id, total_price, bill_date FROM tbl_bills WHERE YEAR(bill_date) = @year`;
        const result = await pool.request().input('month', sql.Int, month).input('year', sql.Int, year).query(query);
        // Trả về plain objects để frontend dễ xử lý
        // Note: limit sẽ được xử lý ở frontend sau khi group by ngày/tháng
        return result.recordset.map(r => ({
            id: r.id,
            total_price: r.total_price,
            bill_date: r.bill_date
        }));
    }

    // 2. SỬA LỖI: Top 5 Sản phẩm (Gói vào OrderDetail và Order)
    async getProductsQuantityByTime(type, month, year) {
        const pool = await poolPromise;
        const timeFilter = (type === 'dailyInMonth')
            ? `WHERE MONTH(o.order_date) = @month AND YEAR(o.order_date) = @year`
            : `WHERE YEAR(o.order_date) = @year`;

        // Lấy số lượng và ngày để Frontend vẽ biểu đồ thời gian
        const query = `SELECT od.quantity, o.order_date, od.productsid, o.id as oid
                       FROM tbl_orderdetails od 
                       JOIN tbl_orders o ON od.ordersid = o.id
                       ${timeFilter}`;

        const result = await pool.request()
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query(query);

        return result.recordset.map(r => ({
            order_date: r.order_date,
            quantity: r.quantity,
            productsid: r.productsid,
            order_id: r.oid
        }));
    }

    // 3. SỬA LỖI: Top Khách hàng (Gói vào User và Bill)
    async getTopCustomers(type, month, year, limit = 10) {
        const pool = await poolPromise;
        const timeFilter = (type === 'dailyInMonth')
            ? `WHERE MONTH(b.bill_date) = @month AND YEAR(b.bill_date) = @year`
            : `WHERE YEAR(b.bill_date) = @year`;

        const query = `SELECT TOP (${limit}) u.name, SUM(b.total_price) as spent, u.id
                       FROM tbl_bills b JOIN tbl_users u ON b.usersid = u.id 
                       ${timeFilter}
                       GROUP BY u.id, u.name
                       ORDER BY spent DESC`;

        const result = await pool.request().input('month', sql.Int, month).input('year', sql.Int, year).query(query);
        // Trả về plain objects để frontend dễ xử lý
        return result.recordset.map(r => ({
            name: r.name,
            spent: r.spent,
            user_id: r.id
        }));
    }

    // 4. Top sản phẩm bán chạy nhất
    async getTopProducts(type, month, year, limit = 10) {
        const pool = await poolPromise;
        const timeFilter = (type === 'dailyInMonth')
            ? `WHERE MONTH(o.order_date) = @month AND YEAR(o.order_date) = @year`
            : `WHERE YEAR(o.order_date) = @year`;

        const query = `
            SELECT TOP (${limit}) od.productsid, p.name as product_name, SUM(od.quantity) as total_quantity
            FROM tbl_orderdetails od 
            JOIN tbl_orders o ON od.ordersid = o.id
            JOIN tbl_products p ON od.productsid = p.id
            ${timeFilter}
            GROUP BY od.productsid, p.name
            ORDER BY total_quantity DESC
        `;

        const request = pool.request()
            .input('month', sql.Int, month)
            .input('year', sql.Int, year);
        const result = await request.query(query);
        return result.recordset.map(r => ({
            product_id: r.productsid,
            product_name: r.product_name,
            total_quantity: r.total_quantity
        }));
    }
}
module.exports = new StatisticDAO();