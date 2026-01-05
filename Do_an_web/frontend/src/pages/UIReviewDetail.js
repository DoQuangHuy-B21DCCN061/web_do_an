// frontend/src/pages/UIReviewDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiSlash, FiCheck, FiArrowLeft, FiCalendar } from 'react-icons/fi';

// Toast component để hiển thị thông báo
function Toast({ show, message, success = true, onClose }) {
    React.useEffect(() => {
        if (show) {
            const t = setTimeout(onClose, 3000);
            return () => clearTimeout(t);
        }
    }, [show, onClose]);
    
    // Thêm CSS animation vào document (chỉ một lần)
    React.useEffect(() => {
        if (!document.getElementById('toast-animation-style')) {
            const style = document.createElement('style');
            style.id = 'toast-animation-style';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);
    
    if (!show) return null;
    return (
        <div style={{ 
            position: 'fixed', 
            zIndex: 9999, 
            top: 24, 
            right: 32, 
            minWidth: 280, 
            background: '#fff', 
            border: `2.5px solid ${success ? "#3fc77a" : "#FF6161"}`, 
            color: success ? '#1d763b' : '#EC1212', 
            borderRadius: 12, 
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)', 
            fontWeight: 500, 
            padding: '16px 36px', 
            fontSize: 16, 
            transition: 'all 0.3s ease', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 14,
            animation: 'slideInRight 0.3s ease-out'
        }}>
            <span style={{ fontSize: 22 }}>{success ? '✅' : '❌'}</span> 
            <span>{message}</span>
        </div>
    );
}

const UIReviewDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', success: true });

    const loadReviews = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
            const data = await res.json();
            // API trả về { success: true, reviews: [...] }
            if (data.success && Array.isArray(data.reviews)) {
                setReviews(data.reviews);
            } else if (Array.isArray(data)) {
                // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
                setReviews(data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách đánh giá:", err);
            setReviews([]);
        }
    }, [productId]);

    useEffect(() => { 
        loadReviews(); 
    }, [loadReviews]);

    const showToast = (message, success = true) => {
        setToast({ show: true, message, success });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', success: true });
    };

    const toggleStatus = async (reviewId, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await res.json();
            if (result.success) {
                showToast("Đã thay đổi trạng thái hiển thị thành công!", true);
                loadReviews();
            } else {
                showToast("Lỗi: " + (result.message || "Không thể cập nhật trạng thái"), false);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            showToast("Lỗi: Không thể kết nối đến server", false);
        }
    };

    return (
        <>
            <Toast 
                show={toast.show} 
                message={toast.message} 
                success={toast.success} 
                onClose={hideToast} 
            />
            <div className="admin-card">
                <button onClick={() => navigate(-1)} className="back-btn"><FiArrowLeft /> Quay lại</button>
                <h3 style={{ marginTop: '15px' }}>⭐ Đánh giá cho sản phẩm: {productId}</h3>

                <table className="admin-table" style={{ width: '100%', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28' }}>
                            <th>Khách hàng</th>
                            <th>Đánh giá</th>
                            <th>Nội dung</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(r => (
                            <tr key={r.id} style={{ opacity: r.status === 0 ? 0.6 : 1 }}>
                                <td><strong>{r.user_name}</strong><br /><small>{r.usersid}</small></td>
                                <td style={{ color: '#FF8D28', fontWeight: 'bold' }}>{r.rating} <FiStar fill="#FF8D28" /></td>
                                <td style={{ fontSize: '13px', width: '30%' }}>{r.comment}</td>
                                <td><FiCalendar /> {new Date(r.created_at).toLocaleDateString()}</td>
                                <td>{r.status === 1 ? '✅ Đang hiện' : '❌ Đang ẩn'}</td>
                                <td>
                                    <button onClick={() => toggleStatus(r.id, r.status)}
                                        style={{ background: r.status === 1 ? '#ff4d4f' : '#2ecc71', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                                        {r.status === 1 ? <FiSlash /> : <FiCheck />} {r.status === 1 ? 'Ẩn' : 'Hiện'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default UIReviewDetail;