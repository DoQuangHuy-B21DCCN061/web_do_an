const { sql, poolPromise } = require("../config/db");

/**
 * Lấy chi tiết thông tin đơn hàng (tổng quan + danh sách sản phẩm + bill)
 * @param {string} orderId
 * @returns {Promise<Object|null>}
 */
exports.getOrderDetails = async (orderId) => {
    const pool = await poolPromise;
    // Lấy detail đơn hàng + sản phẩm
    const rs = await pool.request()
        .input("orderId", sql.VarChar, orderId)
        .query(`
            SELECT
                o.id AS order_id, o.usersid,
                o.receiver_name, o.receiver_address, o.receiver_phone, o.payment_method,
                o.status, o.order_date,
                od.productsid, od.quantity, od.price,
                p.name as product_name
            FROM tbl_orders o
            LEFT JOIN tbl_orderdetails od ON o.id = od.ordersid
            LEFT JOIN tbl_products p ON od.productsid = p.id
            WHERE o.id = @orderId
        `);
    if (!rs.recordset.length) {
        // Nếu không có bản ghi nào từ JOIN, thử lấy thông tin đơn hàng cơ bản
        const orderRs = await pool.request()
            .input("orderId", sql.VarChar, orderId)
            .query(`SELECT id AS order_id, usersid, receiver_name, receiver_address, receiver_phone, payment_method, status, order_date FROM tbl_orders WHERE id = @orderId`);
        if (!orderRs.recordset.length) return null;
        const order = orderRs.recordset[0];
        // Lấy tổng số tiền và sản phẩm nếu có bill
        const billData = await pool.request()
            .input("orderId", sql.VarChar, order.order_id)
            .query("SELECT total_price, total_amount FROM tbl_bills WHERE ordersid = @orderId");
        const bill = billData.recordset[0] || {};
        return {
            orderId: order.order_id,
            userId: order.usersid,
            customerInfo: {
                name: order.receiver_name,
                phone: order.receiver_phone,
                address: order.receiver_address
            },
            paymentMethod: order.payment_method,
            status: order.status,
            orderDate: order.order_date,
            items: [],
            totalAmount: bill.total_price || null,
            totalProduct: bill.total_amount || null
        };
    }
    const order = rs.recordset[0];
    const items = rs.recordset[0].productsid ? rs.recordset.map(r => ({
        productsid: r.productsid,
        product_name: r.product_name || r.productsid,
        quantity: r.quantity,
        price: r.price
    })) : [];

    // Lấy tổng số tiền và tổng sản phẩm từ tbl_bills (nếu có)
    const billData = await pool.request()
        .input("orderId", sql.VarChar, order.order_id)
        .query("SELECT total_price, total_amount FROM tbl_bills WHERE ordersid = @orderId");
    const bill = billData.recordset[0] || {};
    return {
        orderId: order.order_id,
        userId: order.usersid,
        customerInfo: {
            name: order.receiver_name,
            phone: order.receiver_phone,
            address: order.receiver_address
        },
        paymentMethod: order.payment_method,
        status: order.status,
        orderDate: order.order_date,
        items,
        totalAmount: bill.total_price || null,
        totalProduct: bill.total_amount || null
    };
};

