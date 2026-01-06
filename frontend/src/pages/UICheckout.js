import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FiCreditCard, FiChevronRight } from 'react-icons/fi';
import '../assets/css/UICheckout.css';

const UICheckout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ id: null, name: '', phone: '', address: '' });
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    const [usePoints, setUsePoints] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            const savedUser = JSON.parse(localStorage.getItem('user'));

            if (savedUser && savedUser.id) {
                // TH1: ĐÃ ĐĂNG NHẬP - Lấy thông tin chi tiết từ DB
                try {
                    const res = await fetch(`http://localhost:5000/api/personal/${savedUser.id.trim()}`);
                    const data = await res.json();
                    if (data.success) {
                        setUser({
                            id: data.user.id,
                            name: data.user.name || '',
                            phone: data.user.phone || '',
                            address: data.user.address || ''
                        });
                    }
                    await fetchCartData(savedUser.id);
                } catch (err) {
                    console.error("Lỗi lấy thông tin người dùng:", err);
                }
            } else {
                // TH2: KHÁCH VÃNG LAI - Lấy giỏ hàng từ localStorage
                const tempCart = JSON.parse(localStorage.getItem('temp_cart')) || [];
                setCartItems(tempCart.map(item => ({
                    productsid: item.id,
                    quantity: item.quantity,
                    sell_price: item.price,
                    name: item.name
                })));
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const fetchCartData = async (userId) => {
        const res = await fetch(`http://localhost:5000/api/cart/${userId.trim()}`);
        const data = await res.json();
        setCartItems(data);
    };

    const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.sell_price || item.price) * item.quantity, 0);
    const deliveryFee = 15000;
    const total = itemsTotal + deliveryFee - (usePoints ? 10000 : 0);

    const handlePlaceOrder = async () => {
        if (!user.name || !user.phone || !user.address) {
            alert("Vui lòng điền đầy đủ thông tin nhận hàng!");
            return;
        }

        const orderData = {
            userId: user.id, // null nếu là khách vãng lai
            customerInfo: {
                name: user.name,
                phone: user.phone,
                address: user.address
            },
            paymentMethod,
            used_points: usePoints ? 10 : 0,
            items: cartItems.map(item => ({
                productsid: item.productsid || item.id,
                quantity: item.quantity,
                price: item.sell_price || item.price
            }))
        };

        try {
            const res = await fetch('http://localhost:5000/api/orders/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await res.json();

            if (paymentMethod === 'VNPAY' && result.vnpay === true) {
                // Gửi sang API tạo payment_url và chuyển hướng đến VNPay
                const vnRes = await fetch('http://localhost:5000/api/vnpay/create_payment_url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                const vnResult = await vnRes.json();
                if (vnResult.paymentUrl) {
                    window.location.href = vnResult.paymentUrl;
                } else {
                    alert("Không lấy được link thanh toán VNPay.");
                }
            } else if (paymentMethod === 'COD' && result.success) {
                alert(result.message || "Đặt hàng thành công!");
                localStorage.removeItem('temp_cart');
                navigate('/');
            } else {
                alert(result.message || "Lỗi đặt hàng");
            }
        } catch (err) {
            alert("Lỗi khi đặt hàng!");
        }
    };


    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;

    return (
        <div className="checkout-page">
            <Header />
            <div className="checkout-container">
                <div className="checkout-form-section">
                    <div className="section-title">
                        <FiCreditCard /> <h2>Thanh toán</h2>
                    </div>

                    <div className="input-group">
                        <label>Tên khách hàng:</label>
                        <input type="text" placeholder="Nhập họ và tên" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Số điện thoại:</label>
                        <input type="text" placeholder="Nhập số điện thoại" value={user.phone} onChange={e => setUser({ ...user, phone: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Địa chỉ nhận hàng:</label>
                        <input type="text" placeholder="Số nhà, tên đường, phường/xã..." value={user.address} onChange={e => setUser({ ...user, address: e.target.value })} />
                    </div>

                    <div className="payment-method-box">
                        <div className="payment-header">
                            <span>Phương thức thanh toán</span> <FiChevronRight />
                        </div>
                        <label className="radio-item">
                            <input type="radio" name="pay" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                            Thanh toán qua VNPay
                        </label>
                        <label className="radio-item">
                            <input type="radio" name="pay" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                            Thanh toán khi nhận hàng (COD)
                        </label>
                    </div>
                </div>

                <aside className="order-summary-sidebar">
                    <div className="summary-card">
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className="sum-row"><span>Phí vận chuyển</span> <span>{formatVND(deliveryFee)}</span></div>
                        <div className="sum-row"><span>Tiền hàng</span> <span>{formatVND(itemsTotal)}</span></div>
                        <div className="sum-row">
                            <label><input type="checkbox" checked={usePoints} onChange={() => setUsePoints(!usePoints)} /> Dùng điểm tích lũy</label>
                        </div>
                        <hr />
                        <div className="total-row"><span>Tổng cộng</span> <span>{formatVND(total)}</span></div>
                        <button className="place-order-btn" onClick={handlePlaceOrder}>Đặt hàng ngay</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default UICheckout;