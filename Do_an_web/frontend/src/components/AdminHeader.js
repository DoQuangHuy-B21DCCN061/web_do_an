import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiMapPin, FiLogOut } from 'react-icons/fi';

const AdminHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    // Định nghĩa placeholder cho từng trang
    const getPlaceholder = () => {
        const path = location.pathname;
        if (path === '/admin/customers') return "Tìm kiếm theo tên khách hàng...";
        if (path === '/admin/products') return "Tìm kiếm theo tên sản phẩm...";
        if (path === '/admin/reviews') return "Tìm kiếm theo tên sản phẩm...";
        if (path === '/admin/suppliers') return "Tìm kiếm theo tên nhà cung cấp...";
        if (path === '/admin/categories') return "Tìm kiếm theo tên danh mục...";
        if (path === '/admin/orders') return "Tìm kiếm theo tên khách hàng...";
        return "Tìm kiếm";
    };

    // Đọc search param từ URL khi component mount hoặc location thay đổi
    useEffect(() => {
        const searchablePaths = ['/admin/orders', '/admin/customers', '/admin/products', '/admin/reviews', '/admin/suppliers', '/admin/categories'];
        if (searchablePaths.includes(location.pathname)) {
            const params = new URLSearchParams(location.search);
            const searchParam = params.get('search') || '';
            setSearchTerm(searchParam);
        } else {
            setSearchTerm('');
        }
    }, [location]);

    // Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        const currentPath = location.pathname;
        const searchablePaths = ['/admin/orders', '/admin/customers', '/admin/products', '/admin/reviews', '/admin/suppliers', '/admin/categories'];
        
        if (searchablePaths.includes(currentPath)) {
            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.set('search', searchTerm.trim());
            }
            // Reset về trang 1 khi search (nếu có phân trang)
            if (currentPath === '/admin/orders' || currentPath === '/admin/customers') {
                params.set('page', '1');
            }
            navigate(`${currentPath}?${params.toString()}`);
        }
    };

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        // 1. Xóa sạch dữ liệu người dùng và token trong trình duyệt
        localStorage.clear();

        // 2. Chuyển hướng ngay lập tức về trang đăng nhập
        navigate('/');
    };

    return (
        <header className="admin-header">
            {/* BÊN TRÁI: Thương hiệu & Địa điểm */}
            <div className="header-left">
                <div className="logo-group">
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'contain',
                            borderRadius: '4px'
                        }} 
                    />
                    <div className="logo-text">
                        <span className="brand-name">KID & MOM STORE</span>
                        <span className="store-name">THANH XUÂN</span>
                    </div>
                </div>
                <div className="location-box">
                    <FiMapPin size={16} />
                    <span>Nếnh, Bắc Ninh</span>
                </div>
            </div>

            {/* GIỮA: Thanh tìm kiếm */}
            <div className="header-search-container">
                <form className="search-bar-wrapper" onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '550px' }}>
                    <FiSearch className="search-icon-inside" size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#FF8D28', cursor: 'pointer', zIndex: 1 }} onClick={handleSearch} />
                    <input 
                        type="text" 
                        placeholder={getPlaceholder()} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '11px 20px 11px 45px', borderRadius: 30, border: '1px solid #FF8D28', fontSize: 14, outline: 'none' }}
                    />
                </form>
            </div>

            {/* PHẢI: Nút Đăng xuất - ĐÃ THÊM ONCLICK */}
            <div className="header-right">
                <button className="btn-logout-pill" onClick={handleLogout}>
                    <FiLogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;