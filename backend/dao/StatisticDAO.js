const { sql, poolPromise } = require('../config/db');
const Bill = require('../models/Bill');
const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');
const User = require('../models/User');

class StatisticDAO {
    // 1. Thống kê doanh thu (Đã chạy đúng)
    async getRevenueByFlex(type, month, year) {
        const pool = await poolPromise;
        const query = (type === 'dailyInMonth')
            ? `SELECT id, total_price, bill_date FROM tbl_bills WHERE MONTH(bill_date) = @month AND YEAR(bill_date) = @year`
            : `SELECT id, total_price, bill_date FROM tbl_bills WHERE YEAR(bill_date) = @year`;
        const result = await pool.request().input('month', sql.Int, month).input('year', sql.Int, year).query(query);
        return result.recordset.map(r => new Bill(r.id, r.total_price, r.bill_date));
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
            // Bước 18, 21: Gói dữ liệu vào thực thể riêng
            detail: new OrderDetail(r.productsid, r.quantity),
            order: new Order(r.oid, r.order_date)
        }));
    }

    // 3. SỬA LỖI: Top 5 Khách hàng (Gói vào User và Bill)
    async getTopCustomers(type, month, year) {
        const pool = await poolPromise;
        const timeFilter = (type === 'dailyInMonth')
            ? `WHERE MONTH(b.bill_date) = @month AND YEAR(b.bill_date) = @year`
            : `WHERE YEAR(b.bill_date) = @year`;

        const query = `SELECT TOP 5 u.name, SUM(b.total_price) as spent, u.id, b.id as bid, b.bill_date
                       FROM tbl_bills b JOIN tbl_users u ON b.usersid = u.id 
                       ${timeFilter}
                       GROUP BY u.name, u.id, b.id, b.bill_date ORDER BY spent DESC`;

        const result = await pool.request().input('month', sql.Int, month).input('year', sql.Int, year).query(query);
        return result.recordset.map(r => ({
            // Bước 6, 9 (Luồng khách hàng): Gói dữ liệu vào User và Bill
            user: new User(r.id, r.name),
            bill: new Bill(r.bid, r.spent, r.bill_date),
            name: r.name
        }));
    }
}
module.exports = new StatisticDAO();