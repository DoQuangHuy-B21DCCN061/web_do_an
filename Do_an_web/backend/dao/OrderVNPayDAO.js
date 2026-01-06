const { sql, poolPromise } = require("../config/db");

exports.getOrderTotal = async (orderId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("orderId", sql.VarChar, orderId)
        .query(`
      SELECT 
          o.id AS order_id,
          SUM(od.price) AS total_amount
      FROM tbl_orders o
      JOIN tbl_orderdetails od ON o.id = od.ordersid
      WHERE o.id = @orderId
      GROUP BY o.id
    `);
    return result.recordset[0];
};

// Lấy thông tin đơn hàng và danh sách sản phẩm đơn hàng để tạo thanh toán VNPay
exports.getOrderDetails = async (orderId) => {
    const pool = await poolPromise;
    const rs = await pool.request()
        .input("orderId", sql.VarChar, orderId)
        .query(`
          SELECT 
              o.id AS order_id, o.usersid,
              o.receiver_name, o.receiver_address, o.receiver_phone, o.payment_method,
              od.productsid, od.quantity, od.price
          FROM tbl_orders o
          JOIN tbl_orderdetails od ON o.id = od.ordersid
          WHERE o.id = @orderId
        `);
    if (!rs.recordset.length) return null;
    const order = rs.recordset[0];
    // Lấy các item
    const items = rs.recordset.map(r => ({
        productsid: r.productsid,
        quantity: r.quantity,
        price: r.price
    }));
    return {
        orderId,
        userId: order.usersid,
        customerInfo: {
            name: order.receiver_name,
            phone: order.receiver_phone,
            address: order.receiver_address
        },
        paymentMethod: order.payment_method,
        items
    };
};
