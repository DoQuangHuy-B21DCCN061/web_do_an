import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate để điều hướng
import Header from '../components/Header';
import '../assets/css/UICart.css';
import { FiPlus, FiMinus, FiShoppingCart, FiMapPin, FiCalendar, FiChevronRight } from 'react-icons/fi';

const UICart = () => {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const loadCartData = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        setLoading(true);

        if (user && user.id) {
            try {
                const response = await fetch(`http://localhost:5000/api/cart/${user.id.trim()}`);
                const data = await response.json();

                const formattedData = data.map(item => ({
                    id: item.productsid.trim(),
                    name: item.name,
                    price: parseFloat(item.sell_price) || 0,
                    quantity: parseInt(item.quantity) || 0,
                    image: item.image_url
                }));
                setCartItems(formattedData);
            } catch (err) {
                console.error("Lỗi tải dữ liệu giỏ hàng:", err);
                setCartItems([]);
            }
        } else {
            const tempCart = JSON.parse(localStorage.getItem('temp_cart')) || [];
            setCartItems(tempCart);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadCartData();
    }, [loadCartData]);

    const updateQuantity = async (id, delta) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
        setCartItems(updatedItems);

        if (user && user.id) {
            const item = updatedItems.find(i => i.id === id);
            await fetch('http://localhost:5000/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id.trim(), productId: id.trim(), quantity: item.quantity })
            });
        } else {
            localStorage.setItem('temp_cart', JSON.stringify(updatedItems));
        }
    };

    const removeItem = async (id) => {
        if (!window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
        const user = JSON.parse(localStorage.getItem('user'));
        const filteredItems = cartItems.filter(item => item.id !== id);
        setCartItems(filteredItems);

        if (user && user.id) {
            await fetch('http://localhost:5000/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id.trim(), productId: id.trim(), quantity: 0 })
            });
        } else {
            localStorage.setItem('temp_cart', JSON.stringify(filteredItems));
        }
    };

    const itemsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = 15000;
    const subtotal = itemsTotal + deliveryFee;

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải giỏ hàng...</div>;

    return (
        <div className="cart-page-container">
            <Header />
            <div className="cart-content-layout">
                <div className="cart-main-section">
                    <div className="market-info-card">
                        <div className="market-details">
                            <div className="market-icon"><FiShoppingCart /></div>
                            <div>
                                <h4>Cửa hàng địa phương</h4>
                                <p><FiMapPin /> Thanh Xuân, Hà Nội</p>
                            </div>
                        </div>
                        <button className="date-picker-btn">
                            <FiCalendar /> Wed 123 <FiChevronRight />
                        </button>
                    </div>

                    <div className="cart-items-list">
                        <div className="list-header">Danh sách mặt hàng</div>
                        {cartItems.length > 0 ? cartItems.map(item => (
                            <div key={item.id} className="cart-item-row">
                                <img src={item.image} alt={item.name} className="item-img" />
                                <div className="item-info">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-price">{formatVND(item.price)}</p>
                                </div>
                                <div className="item-controls">
                                    <div className="quantity-toggle">
                                        <button onClick={() => updateQuantity(item.id, -1)}><FiMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}><FiPlus /></button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeItem(item.id)}>Xóa</button>
                                </div>
                                <div className="item-subtotal">{formatVND(item.price * item.quantity)}</div>
                            </div>
                        )) : <p style={{ textAlign: 'center', padding: '20px' }}>Giỏ hàng đang trống.</p>}
                    </div>
                </div>

                <aside className="cart-sidebar">
                    <div className="summary-card">
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className="summary-row"><span>Tiền hàng</span><span>{formatVND(itemsTotal)}</span></div>
                        <div className="summary-row"><span>Phí giao hàng</span><span>{formatVND(deliveryFee)}</span></div>
                        <hr />
                        <div className="summary-row total"><span>Tổng cộng</span><span>{formatVND(subtotal)}</span></div>

                        {/* Cập nhật sự kiện onClick để chuyển sang trang Checkout */}
                        <button
                            className="checkout-btn"
                            onClick={() => navigate('/checkout')}
                            disabled={cartItems.length === 0}
                        >
                            Thanh toán {formatVND(subtotal)}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default UICart;