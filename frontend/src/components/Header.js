import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMapPin } from 'react-icons/fi';
import '../assets/css/Header.css';

const Header = ({ initialSearchTerm = "", onResetFilter }) => {
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    // Cập nhật hàm handleSearch để xử lý cả khi nhấn Enter và nhấn vào Icon
    const handleSearch = (e) => {
        if (e) e.preventDefault(); // Ngăn trang bị load lại nếu nhấn Enter trong form

        if (searchTerm.trim()) {
            navigate(`/search?query=${searchTerm.trim()}`);
        }
    };

    const handleLogoClick = () => {
        if (onResetFilter) onResetFilter();
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="header-top-container">
                {/* Logo & Location */}
                <div className="header-left">
                    <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                        <div className="logo-text">
                            <span className="brand-name">KID & MOM STORE</span>
                            <span className="brand-sub">THANH XUÂN</span>
                        </div>
                    </div>
                    <div className="location-info">
                        <FiMapPin /> <span>Nênh, Bắc Ninh</span>
                    </div>
                </div>

                {/* Search Bar */}
                <form className="search-section" onSubmit={handleSearch}>
                    <div className="search-wrapper">
                        {/* THÊM onClick VÀO ĐÂY */}
                        <FiSearch
                            className="search-icon"
                            onClick={handleSearch}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                {/* Actions: Cart & User */}
                <div className="header-right">
                    <div className="cart-info" onClick={() => navigate('/cart')}>
                        <div className="cart-icon-wrapper">
                            <FiShoppingCart />
                            <span className="cart-badge">14</span>
                        </div>
                        <span className="cart-text">Giỏ hàng</span>
                    </div>

                    {user ? (
                        <div className="user-actions">
                            <button className="user-btn" onClick={() => navigate('/customer/profile')}>
                                <FiUser /> <span>{user.name}</span>
                            </button>
                            <button className="logout-header-btn" onClick={handleLogout}>
                                <FiLogOut /> <span>Đăng xuất</span>
                            </button>
                        </div>
                    ) : (
                        <button className="login-header-btn" onClick={() => navigate('/login')}>
                            <FiUser /> <span>Đăng nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;