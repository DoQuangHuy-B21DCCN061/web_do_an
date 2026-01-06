import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPieChart, FiUsers, FiShoppingBag, FiBox, FiTruck, FiLayers, FiStar, FiSettings } from 'react-icons/fi';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Thống kê', path: '/admin/statistic', icon: <FiPieChart /> },
        { name: 'Khách hàng', path: '/admin/customers', icon: <FiUsers /> },
        { name: 'Đơn hàng', path: '/admin/orders', icon: <FiShoppingBag /> },
        { name: 'Sản phẩm', path: '/admin/products', icon: <FiBox /> },
        { name: 'Nhà cung cấp', path: '/admin/suppliers', icon: <FiTruck /> },
        { name: 'Danh mục', path: '/admin/categories', icon: <FiLayers /> },
        { name: 'Đánh giá', path: '/admin/reviews', icon: <FiStar /> },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-profile" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" style={{ width: '40px', borderRadius: '50%' }} />
                <span style={{ fontWeight: 'bold' }}>Admin</span>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1, padding: '0 15px' }}>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path}
                            className={location.pathname === item.path ? 'active' : ''}
                            onClick={() => navigate(item.path)}>
                            {item.icon} <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;