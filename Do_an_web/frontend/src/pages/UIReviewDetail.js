// frontend/src/pages/UIReviewDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiSlash, FiCheck, FiArrowLeft, FiCalendar } from 'react-icons/fi';

const UIReviewDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);

    useEffect(() => { loadReviews(); }, [productId]);

    const loadReviews = async () => {
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
    };

    const toggleStatus = async (reviewId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            alert("Thông báo: Đã thay đổi trạng thái hiển thị!");
            loadReviews();
        }
    };

    return (
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
    );
};
export default UIReviewDetail;