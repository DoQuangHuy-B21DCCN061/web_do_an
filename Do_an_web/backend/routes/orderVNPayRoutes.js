let express = require('express');
let router = express.Router();
let moment = require('moment');
let crypto = require("crypto");
let qs = require("qs");
const vnpConfig = require('../config/vnpay');

const OrderDAO = require("../dao/OrderVNPayDAO.js");
const OrderManageDAO = require('../dao/OrderManageDAO');

// Lưu tạm thời orderData theo txnRef để IPN về mới thực tế thêm vào DB
const tempOrders = {};

router.post('/create_payment_url', async function (req, res, next) {
    let orderData;
    if (req.body.orderId && !req.body.items) {
        orderData = await OrderDAO.getOrderDetails(req.body.orderId);
        if (!orderData) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng trong hệ thống" });
        }
    } else {
        orderData = req.body;
    }
    console.log('[VNPay create_payment_url] Dữ liệu nhận được:', orderData);
    const orderId = 'TXN' + Date.now(); // sinh transaction reference tạm thời

    const items = Array.isArray(orderData.items) ? orderData.items : [];
    if (items.length === 0) {
        console.error('[VNPay] Thiếu giỏ hàng hoặc giỏ hàng rỗng!');
        res.status(400).json({ message: 'Không có sản phẩm nào trong giỏ hàng' });
        return;
    }
    const amount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tmnCode = vnpConfig.vnp_TmnCode;
    const secretKey = vnpConfig.vnp_HashSecret;
    const vnpUrl = vnpConfig.vnp_Url;
    const returnUrl = vnpConfig.vnp_ReturnUrl;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
        vnp_OrderType: 'billpayment',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    tempOrders[orderId] = { ...orderData, amount, createdAt: Date.now() };

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
    res.json({ paymentUrl, orderId });
});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[decodeURIComponent(str[i])]).replace(/%20/g, "+");
    }
    return sorted;
}

// Return URL handler - xử lý khi user quay lại từ VNPay (tạo đơn hàng và bill nếu thành công)
router.get('/vnpay_return', async function (req, res, next) {
    let vnp_Params = { ...req.query };

    const secureHash = vnp_Params['vnp_SecureHash'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const vnp_Amount = Number(vnp_Params['vnp_Amount']) / 100;
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const hmac = crypto.createHmac("sha512", vnpConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    if (secureHash !== signed) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    const tempOrder = tempOrders[txnRef];
    if (!tempOrder) {
        return res.status(404).json({ success: false, message: 'Order not found temp.' });
    }
    if (tempOrder.amount !== vnp_Amount) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    if ((vnp_ResponseCode === '00' || vnp_TransactionStatus === '00') && !tempOrder.processed) {
        try {
            await OrderManageDAO.placeOrder(tempOrder);
            tempOrder.processed = true;
            return res.json({ success: true, message: 'Tạo đơn hàng thành công qua VNPay!' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng: ' + err.message });
        }
    } else if (tempOrder.processed) {
        return res.json({ success: true, message: 'Đơn hàng đã được xử lý trước đó.' });
    } else {
        return res.json({ success: false, message: 'Thanh toán thất bại!' });
    }
});

// IPN (server-to-server) - VNPAY gọi tới đây để thông báo kết quả thực tế
router.get('/vnpay_ipn', async function (req, res, next) {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const vnp_Amount = Number(vnp_Params['vnp_Amount']) / 100;
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

    let returnData = { RspCode: '', Message: '' };

    // 1. Kiểm tra checksum
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    if (secureHash !== signed) {
        returnData.RspCode = '97'; returnData.Message = 'Invalid signature';
        return res.status(200).json(returnData);
    }

    // 2. Tìm tempOrder lưu trong bộ nhớ hoặc DB tạm (tùy kiến trúc thực tế)
    const tempOrder = tempOrders[txnRef];
    if (!tempOrder) {
        returnData.RspCode = '01'; returnData.Message = 'Order not found';
        return res.status(200).json(returnData);
    }

    // 3. Kiểm tra số tiền giữa hai hệ thống
    if (tempOrder.amount !== vnp_Amount) {
        returnData.RspCode = '04'; returnData.Message = 'Invalid amount';
        return res.status(200).json(returnData);
    }

    // 4. Kiểm tra trạng thái giao dịch: Không xử lý nếu đã tạo đơn/trừ kho
    if (tempOrder.processed) {
        returnData.RspCode = '02'; returnData.Message = 'Order already confirmed';
        return res.status(200).json(returnData);
    }

    // 5. Cập nhật: nếu thanh toán thành công thì mới TẠO ĐƠN HÀNG & TRỪ TỒN KHO
    if (vnp_ResponseCode === '00' || vnp_TransactionStatus === '00') {
        try {
            await OrderManageDAO.placeOrder(tempOrder); // chỉ lúc này mới tạo/trừ kho
            tempOrder.processed = true;
            returnData.RspCode = '00';
            returnData.Message = 'Confirm Success';
        } catch (err) {
            returnData.RspCode = '99';
            returnData.Message = 'Database error';
        }
    } else {
        // Không thành công
        tempOrder.processed = true;
        returnData.RspCode = '00';
        returnData.Message = 'Payment Failed/Rejected';
    }
    return res.status(200).json(returnData);
});

module.exports = router;
