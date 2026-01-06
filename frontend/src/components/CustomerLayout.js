// frontend/src/components/CustomerLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiPackage, FiStar, FiSettings, FiLogOut, FiSearch, FiShoppingCart } from 'react-icons/fi';
import '../assets/css/CustomerLayout.css';

const CustomerLayout = () => {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="customer-container">
            {/* Header chung cho khách hàng */}
            <header className="customer-header">
                <div className="header-left">
                    <Link to="/" className="logo-text">KID & MOM STORE</Link>
                </div>
                <div className="header-center">
                    <div className="search-wrapper">
                        <FiSearch />
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." />
                    </div>
                </div>
                <div className="header-right">
                    <div className="cart-btn">
                        <FiShoppingCart /> <span>Giỏ hàng</span>
                        <span className="badge">14</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn-header">
                        <FiLogOut /> Đăng xuất
                    </button>
                </div>
            </header>

            <div className="customer-main">
                {/* Sidebar cố định bên trái */}
                <aside className="customer-sidebar">
                    <div className="user-profile-summary">
                        <div className="avatar-placeholder">
                            <img 
                                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+RjTwvdGV4dD48L3N2Zz4=" 
                                alt="User"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+RjTwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                        </div>
                        <div className="user-info-text">
                            <p className="user-name-sidebar">{user?.name || 'Khách hàng'}</p>
                        </div>
                    </div>

                    <nav className="customer-nav">
                        <Link to="/customer/profile" className={`nav-link ${location.pathname.includes('profile') ? 'active' : ''}`}>
                            <FiUser /> Thông tin cá nhân
                        </Link>
                        <Link to="/customer/orders" className={`nav-link ${location.pathname.includes('orders') ? 'active' : ''}`}>
                            <FiPackage /> Đơn hàng
                        </Link>
                        <Link to="/customer/reviews" className={`nav-link ${location.pathname.includes('reviews') ? 'active' : ''}`}>
                            <FiStar /> Đánh giá
                        </Link>
                        <hr />
                        <Link to="/customer/settings" className="nav-link">
                            <FiSettings /> Tài khoản
                        </Link>
                    </nav>
                </aside>

                {/* Nội dung thay đổi theo Route */}
                <main className="customer-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;