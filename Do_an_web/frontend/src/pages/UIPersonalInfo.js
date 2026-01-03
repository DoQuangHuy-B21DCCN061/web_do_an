import React, { useState, useEffect } from 'react';
import { FiEdit3, FiUser, FiPackage, FiStar, FiLogOut } from 'react-icons/fi';
import '../assets/css/UIPersonalInfo.css';

const UIPersonalInfo = () => {
    const [user, setUser] = useState({ id: '', name: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Lấy thông tin người dùng khi load trang
    useEffect(() => {
        const fetchUserData = async () => {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser && savedUser.id) {
                try {
                    const res = await fetch(`http://localhost:5000/api/personal/${savedUser.id}`);
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    }
                } catch (err) {
                    console.error("Lỗi kết nối API:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, []);

    // Xử lý cập nhật thông tin
    const actionPerformed = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/personal/change-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const result = await res.json();
            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.user));
                setUser(result.user);
                setIsEditing(false);
                alert("Thay đổi thông tin thành công!");
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (err) {
            alert("Không thể kết nối đến Server.");
        }
    };

    if (loading) return <div className="loading-text">Đang tải thông tin...</div>;

    return (
        <div className="profile-page">
            <div className="profile-layout">
                {/* --- Sidebar bên trái --- */}

                {/* --- Nội dung chi tiết bên phải --- */}
                <main className="profile-content">
                    <h2>Hồ sơ cá nhân</h2>
                    <div className="detail-card">

                        {/* Mục: Tên */}
                        <div className="detail-item">
                            <div className="detail-info">
                                <label>Họ và tên</label>
                                {isEditing ? (
                                    <input
                                        value={user.name}
                                        onChange={e => setUser({ ...user, name: e.target.value })}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{user.name || "Chưa thiết lập"}</span>
                                )}
                            </div>
                            <FiEdit3 className="edit-icon" onClick={() => setIsEditing(true)} />
                        </div>

                        {/* Mục: Số điện thoại */}
                        <div className="detail-item">
                            <div className="detail-info">
                                <label>Số điện thoại</label>
                                {isEditing ? (
                                    <input
                                        value={user.phone}
                                        onChange={e => setUser({ ...user, phone: e.target.value })}
                                    />
                                ) : (
                                    <span>{user.phone || "Chưa thiết lập"}</span>
                                )}
                            </div>
                            <FiEdit3 className="edit-icon" onClick={() => setIsEditing(true)} />
                        </div>

                        {/* Mục: Địa chỉ */}
                        <div className="detail-item">
                            <div className="detail-info">
                                <label>Địa chỉ nhận hàng</label>
                                {isEditing ? (
                                    <input
                                        value={user.address}
                                        onChange={e => setUser({ ...user, address: e.target.value })}
                                    />
                                ) : (
                                    <span>{user.address || "Chưa thiết lập"}</span>
                                )}
                            </div>
                            <FiEdit3 className="edit-icon" onClick={() => setIsEditing(true)} />
                        </div>

                        {/* Nút điều hướng khi đang chỉnh sửa */}
                        {isEditing && (
                            <div className="action-group">
                                <button className="save-btn" onClick={actionPerformed}>Lưu thay đổi</button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                    style={{ marginTop: '10px', width: '100%', padding: '10px', border: 'none', background: '#eee', borderRadius: '10px', cursor: 'pointer' }}
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UIPersonalInfo;