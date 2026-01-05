import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const UIReviewManage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const itemsPerPage = 10;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const searchQuery = searchParam ? `&search=${encodeURIComponent(searchParam)}` : '';
        // Lớp UIReviewManage thực hiện lệnh gọi đến lớp ProductDAO qua API
        fetch(`http://localhost:5000/api/products?page=1&limit=1000${searchQuery}`)
            .then(res => res.json())
            .then(data => {
                // API trả về { products: [...], total: ... }
                let allProducts = [];
                if (data.products && Array.isArray(data.products)) {
                    allProducts = data.products;
                } else if (Array.isArray(data)) {
                    // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
                    allProducts = data;
                }
                setProducts(allProducts);
                // Tính tổng số trang
                const total = Math.ceil(allProducts.length / itemsPerPage);
                setTotalPages(total > 0 ? total : 1);
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách sản phẩm:", err);
                setProducts([]);
                setTotalPages(1);
            });
    }, [location.search]);

    // actionPerformed() gọi đến lớp UIReviewDetail
    const handleViewReviews = (productId) => {
        navigate(`/admin/reviews/product/${productId}`);
    };

    // Tính toán sản phẩm hiển thị trên trang hiện tại
    const getCurrentPageProducts = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return products.slice(startIndex, endIndex);
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const currentProducts = getCurrentPageProducts();

    return (
        <div className="admin-card">
            <h2 style={{ color: '#333', marginBottom: '10px' }}>
                <FiMessageSquare /> Quản lý Đánh giá sản phẩm
            </h2>
            <p style={{ color: '#666', marginBottom: '25px' }}>
                Chọn một sản phẩm để quản lý các đánh giá của khách hàng.
            </p>

            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ 
                    width: '100%', 
                    marginTop: '20px',
                    borderCollapse: 'separate',
                    borderSpacing: '0 8px'
                }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28' }}>
                            <th style={{ 
                                padding: '15px 20px', 
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                borderBottom: '2px solid #FF8D28'
                            }}>ID</th>
                            <th style={{ 
                                padding: '15px 20px', 
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                borderBottom: '2px solid #FF8D28'
                            }}>Tên Sản Phẩm</th>
                            <th style={{ 
                                padding: '15px 20px', 
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                borderBottom: '2px solid #FF8D28'
                            }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.length > 0 ? (
                            currentProducts.map(p => (
                                <tr key={p.id} style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <td style={{ 
                                        padding: '18px 20px',
                                        textAlign: 'left',
                                        borderTopLeftRadius: '8px',
                                        borderBottomLeftRadius: '8px',
                                        fontSize: '14px',
                                        color: '#555'
                                    }}>{p.id}</td>
                                    <td style={{ 
                                        padding: '18px 20px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#333'
                                    }}>{p.name}</td>
                                    <td style={{ 
                                        padding: '18px 20px',
                                        textAlign: 'left',
                                        borderTopRightRadius: '8px',
                                        borderBottomRightRadius: '8px'
                                    }}>
                                        <button 
                                            onClick={() => handleViewReviews(p.id)} 
                                            style={{
                                                background: 'linear-gradient(135deg, #FF8D28 0%, #FF6B00 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 4px rgba(255, 141, 40, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 8px rgba(255, 141, 40, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 2px 4px rgba(255, 141, 40, 0.3)';
                                            }}
                                        >
                                            <FiEye style={{ fontSize: '16px' }} /> Xem đánh giá
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ 
                                    padding: '40px 20px', 
                                    textAlign: 'center', 
                                    color: '#999',
                                    fontSize: '14px'
                                }}>
                                    Không có sản phẩm nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '30px',
                    padding: '20px 0'
                }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            background: currentPage === 1 ? '#f5f5f5' : '#fff',
                            color: currentPage === 1 ? '#ccc' : '#333',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.background = '#f8f8f8';
                                e.target.style.borderColor = '#FF8D28';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.background = '#fff';
                                e.target.style.borderColor = '#ddd';
                            }
                        }}
                    >
                        <FiChevronLeft /> Trước
                    </button>

                    <div style={{
                        display: 'flex',
                        gap: '5px',
                        alignItems: 'center'
                    }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '10px 15px',
                                            border: '1px solid #ddd',
                                            background: currentPage === page ? '#FF8D28' : '#fff',
                                            color: currentPage === page ? '#fff' : '#333',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: currentPage === page ? '600' : '400',
                                            minWidth: '40px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== page) {
                                                e.target.style.background = '#FFF5EC';
                                                e.target.style.borderColor = '#FF8D28';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== page) {
                                                e.target.style.background = '#fff';
                                                e.target.style.borderColor = '#ddd';
                                            }
                                        }}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return (
                                    <span key={page} style={{ padding: '0 5px', color: '#999' }}>
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                            color: currentPage === totalPages ? '#ccc' : '#333',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.background = '#f8f8f8';
                                e.target.style.borderColor = '#FF8D28';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.background = '#fff';
                                e.target.style.borderColor = '#ddd';
                            }
                        }}
                    >
                        Sau <FiChevronRight />
                    </button>
                </div>
            )}

            {/* Hiển thị thông tin trang */}
            {products.length > 0 && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '15px',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, products.length)} trong tổng số {products.length} sản phẩm
                </div>
            )}
        </div>
    );
};
export default UIReviewManage;