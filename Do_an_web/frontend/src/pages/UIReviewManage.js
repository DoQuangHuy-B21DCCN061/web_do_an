import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiEye } from 'react-icons/fi';

const UIReviewManage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const searchQuery = searchParam ? `?search=${encodeURIComponent(searchParam)}` : '';
        // Lớp UIReviewManage thực hiện lệnh gọi đến lớp ProductDAO qua API
        fetch(`http://localhost:5000/api/products?page=1&limit=1000${searchQuery}`)
            .then(res => res.json())
            .then(data => {
                // API trả về { products: [...], total: ... }
                if (data.products && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (Array.isArray(data)) {
                    // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách sản phẩm:", err);
                setProducts([]);
            });
    }, [location.search]);

    // actionPerformed() gọi đến lớp UIReviewDetail
    const handleViewReviews = (productId) => {
        navigate(`/admin/reviews/product/${productId}`);
    };

    return (
        <div className="admin-card">
            <h2 style={{ color: '#333' }}><FiMessageSquare /> Quản lý Đánh giá sản phẩm</h2>
            <p style={{ color: '#666' }}>Chọn một sản phẩm để quản lý các đánh giá của khách hàng.</p>

            <table className="admin-table" style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#FFF5EC', color: '#FF8D28' }}>
                        <th>ID</th>
                        <th>Tên Sản Phẩm</th>
                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td style={{ fontWeight: '600' }}>{p.name}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button onClick={() => handleViewReviews(p.id)} className="edit-btn">
                                    <FiEye /> Xem đánh giá
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default UIReviewManage;