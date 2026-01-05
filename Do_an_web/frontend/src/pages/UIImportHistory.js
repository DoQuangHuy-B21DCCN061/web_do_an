import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const UIImportHistory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [importHistory, setImportHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        loadImportHistory(pageParam);
    }, [location.search]);

    const loadImportHistory = async (currentPage = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/products/import/history?page=${currentPage}&limit=${limit}`);
            const data = await res.json();
            if (data.success && data.imports) {
                setImportHistory(data.imports);
                setTotal(data.total || 0);
            } else {
                setImportHistory([]);
                setTotal(0);
            }
        } catch (err) {
            console.error("Lỗi khi tải lịch sử nhập:", err);
            setImportHistory([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    return (
        <div className="admin-main-wrapper">
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button 
                            onClick={() => navigate('/admin/products')} 
                            style={{ 
                                border: 'none', 
                                background: 'none', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#666',
                                fontSize: '16px'
                            }}
                        >
                            <FiArrowLeft /> Quay lại
                        </button>
                        <h2 style={{ color: '#333', margin: 0 }}>📋 Lịch sử nhập sản phẩm</h2>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Đang tải dữ liệu...
                    </div>
                ) : importHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Chưa có lịch sử nhập sản phẩm nào.
                    </div>
                ) : (
                    <>
                        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#FFF5EC', color: '#FF8D28', textAlign: 'left' }}>
                                    <th style={{ padding: '15px' }}>ID</th>
                                    <th>Ngày nhập</th>
                                    <th>Sản phẩm</th>
                                    <th>Nhà cung cấp</th>
                                    <th style={{ textAlign: 'right' }}>Số lượng</th>
                                    <th style={{ textAlign: 'right' }}>Giá nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importHistory.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        style={{ 
                                            borderBottom: '1px solid #f2f2f2'
                                        }}
                                    >
                                        <td style={{ padding: '15px' }}>{item.id}</td>
                                        <td>{formatDate(item.import_date)}</td>
                                        <td style={{ fontWeight: '600' }}>
                                            {item.product_name || 'N/A'} 
                                            {item.product_id && <span style={{ color: '#666', fontSize: '12px', marginLeft: '5px' }}>({item.product_id})</span>}
                                        </td>
                                        <td>
                                            {item.supplier_name || 'N/A'}
                                            {item.supplier_id && <span style={{ color: '#666', fontSize: '12px', marginLeft: '5px' }}>({item.supplier_id})</span>}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{item.quantity?.toLocaleString('vi-VN') || 0}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.import_price || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {total > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '20px' }}>
                                <button 
                                    onClick={() => {
                                        const newPage = Math.max(1, page - 1);
                                        setPage(newPage);
                                        navigate(`/admin/products/import/history?page=${newPage}`);
                                    }}
                                    disabled={page === 1}
                                    style={{ 
                                        padding: '8px 16px', 
                                        border: '1px solid #ddd', 
                                        background: page === 1 ? '#f5f5f5' : '#fff', 
                                        borderRadius: '6px', 
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <FiChevronLeft /> Trước
                                </button>
                                <span style={{ padding: '8px 16px', color: '#666' }}>
                                    Trang {page} / {Math.ceil(total / limit)}
                                </span>
                                <button 
                                    onClick={() => {
                                        const newPage = Math.min(Math.ceil(total / limit), page + 1);
                                        setPage(newPage);
                                        navigate(`/admin/products/import/history?page=${newPage}`);
                                    }}
                                    disabled={page >= Math.ceil(total / limit)}
                                    style={{ 
                                        padding: '8px 16px', 
                                        border: '1px solid #ddd', 
                                        background: page >= Math.ceil(total / limit) ? '#f5f5f5' : '#fff', 
                                        borderRadius: '6px', 
                                        cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    Sau <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UIImportHistory;

