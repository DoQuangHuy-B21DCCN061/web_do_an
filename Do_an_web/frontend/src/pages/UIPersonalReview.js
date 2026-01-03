import React, { useState, useEffect } from 'react';
import { FiStar, FiEdit3, FiUser, FiPackage, FiLogOut } from 'react-icons/fi';
import '../assets/css/UIPersonalInfo.css';

const UIPersonalReview = () => {
    const [reviews, setReviews] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser?.id) {
            try {
                const res = await fetch(`http://localhost:5000/api/reviews/user/${savedUser.id}`);
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (err) {
                console.error("Lỗi kết nối API:", err);
            } finally {
                setLoading(false); // Hoàn tất tải dữ liệu
            }
        }
    };

    const handleEditClick = (review) => {
        setEditingId(review.id);
        setEditData({ rating: review.rating, comment: review.comment });
    };

    // Hàm actionPerformed xử lý khi nhấn "Lưu thay đổi"
    const actionPerformed = async (id) => {
        try {
            const res = await fetch('http://localhost:5000/api/reviews/change-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...editData })
            });
            const result = await res.json();
            if (result.success) {
                alert("Cập nhật đánh giá thành công!");
                setEditingId(null);
                fetchReviews(); // Tải lại danh sách sau khi sửa
            }
        } catch (err) {
            alert("Lỗi kết nối.");
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-layout">
                {/* Sidebar điều hướng */}

                {/* Nội dung chính */}
                <main className="profile-content">
                    <h2>Đánh giá của tôi</h2>

                    {loading ? (
                        <div className="loading-text" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                            Đang tải danh sách đánh giá...
                        </div>
                    ) : reviews.length === 0 ? (
                        /* Giao diện khi không có đánh giá nào */
                        <div className="empty-state" style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fff',
                            borderRadius: '15px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                        }}>
                            <FiStar size={50} color="#ddd" style={{ marginBottom: '20px' }} />
                            <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
                                Bạn chưa có đánh giá nào cho các sản phẩm đã mua.
                            </p>
                            <button
                                className="save-btn"
                                onClick={() => window.location.href = '/'}
                                style={{ maxWidth: '200px', margin: '0 auto' }}
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    ) : (
                        /* Hiển thị danh sách đánh giá */
                        <div className="review-list">
                            {reviews.map(review => (
                                <div key={review.id} className="detail-card" style={{ marginBottom: '15px' }}>
                                    <div className="detail-info">
                                        <label style={{ color: '#FF8D28', fontWeight: 'bold' }}>Sản phẩm: {review.product_name}</label>

                                        {editingId === review.id ? (
                                            <div style={{ marginTop: '10px' }}>
                                                <select
                                                    value={editData.rating}
                                                    onChange={e => setEditData({ ...editData, rating: parseInt(e.target.value) })}
                                                    style={{
                                                        marginBottom: '10px',
                                                        padding: '8px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #FF8D28',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Sao</option>)}
                                                </select>
                                                <textarea
                                                    value={editData.comment}
                                                    onChange={e => setEditData({ ...editData, comment: e.target.value })}
                                                    className="edit-input"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '100px',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ddd',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                    <button className="save-btn" onClick={() => actionPerformed(review.id)}>Lưu thay đổi</button>
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => setEditingId(null)}
                                                        style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '8px' }}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: '5px' }}>
                                                <div style={{ color: '#FF8D28', marginBottom: '8px', display: 'flex', gap: '2px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            fill={i < review.rating ? "#FF8D28" : "none"}
                                                            color={i < review.rating ? "#FF8D28" : "#ddd"}
                                                        />
                                                    ))}
                                                </div>
                                                <p style={{ margin: '0 0 10px 0', color: '#555', lineHeight: '1.5' }}>{review.comment}</p>
                                                <div
                                                    className="edit-icon"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#FF8D28', cursor: 'pointer' }}
                                                    onClick={() => handleEditClick(review)}
                                                >
                                                    <FiEdit3 /> <span>Chỉnh sửa đánh giá</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UIPersonalReview;