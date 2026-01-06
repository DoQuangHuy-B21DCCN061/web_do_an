import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const UIVNpayCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const responseCode = params.get('vnp_ResponseCode');
        const txnRef = params.get('vnp_TxnRef');

        // Khi return từ VNPay về (FE nhận responseCode, txnRef, ...) => GỌI API xác nhận và tạo đơn/bill
        if (responseCode && txnRef) {
            (async () => {
                setStatus('Đang xác nhận thanh toán và tạo đơn hàng...');
                try {
                    // Gọi thẳng toàn bộ query trả về để backend xác nhận và tạo đơn hàng
                    const res = await fetch(`http://localhost:5000/api/vnpay/vnpay_return${location.search}`);
                    const result = await res.json();
                    if (result.success) {
                        setStatus('Thanh toán thành công! Đang chuyển hướng...');
                        localStorage.removeItem('temp_cart');
                        setTimeout(() => navigate('/', { state: { message: 'Đặt hàng thành công!' } }), 1800);
                    } else {
                        setStatus(`Thanh toán thất bại: ${result.message || ''}`);
                    }
                } catch (err) {
                    setStatus('Lỗi khi xác nhận thanh toán: ' + err.message);
                }
            })();
            return;
        }

        setStatus('Không tìm thấy thông tin thanh toán hợp lệ từ VNPay!');
    }, [location.search, navigate]);

    return (
        <div>
            <Header />
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Thanh toán VNPay</h2>
                <p>{status || 'Đang xử lý...'}</p>
            </div>
        </div>
    );
};

export default UIVNpayCheckout;
