import React, { useState } from 'react';
import { FiLock, FiUser, FiPackage, FiStar, FiLogOut, FiSettings } from 'react-icons/fi';
import '../assets/css/UIPersonalInfo.css';

const UIPersonalAccountSetting = () => {
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const savedUser = JSON.parse(localStorage.getItem('user'));

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/personal/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: savedUser.id, ...passData })
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message);
                setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert("Lỗi kết nối server");
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-layout">


                {/* Main Content */}
                <main className="profile-content">
                    <h2>Thiết lập tài khoản</h2>
                    <div className="detail-card">
                        <form onSubmit={handleUpdatePassword}>
                            <div className="detail-item">
                                <div className="detail-info">
                                    <label>Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        value={passData.oldPassword}
                                        onChange={e => setPassData({ ...passData, oldPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <FiLock className="edit-icon" />
                            </div>

                            <div className="detail-item">
                                <div className="detail-info">
                                    <label>Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passData.newPassword}
                                        onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <FiLock className="edit-icon" />
                            </div>

                            <div className="detail-item">
                                <div className="detail-info">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passData.confirmPassword}
                                        onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <FiLock className="edit-icon" />
                            </div>

                            <button type="submit" className="save-btn">Cập nhật mật khẩu</button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UIPersonalAccountSetting;