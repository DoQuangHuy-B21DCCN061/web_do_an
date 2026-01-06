import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import '../assets/css/AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-container">
            {/* Header chiếm trọn chiều ngang phía trên */}
            <AdminHeader />

            <div className="admin-body-content">
                {/* Lớp bọc Sidebar cố định 20% bên trái */}
                <div className="admin-sidebar-wrapper">
                    <AdminSidebar />
                </div>

                {/* Nội dung trang hiển thị chiếm 80% bên phải */}
                <main className="admin-main-display">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;