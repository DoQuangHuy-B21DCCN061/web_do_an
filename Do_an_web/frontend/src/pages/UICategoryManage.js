import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiList, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Toast component
function Toast({ show, message, success = true, onClose }) {
    React.useEffect(() => {
        if (show) {
            const t = setTimeout(onClose, 3000);
            return () => clearTimeout(t);
        }
    }, [show, onClose]);
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', zIndex: 9999, top: 24, right: 32, minWidth: 240, background: '#fff', border: `2.5px solid ${success ? "#3fc77a" : "#FF6161"}`, color: success ? '#1d763b' : '#EC1212', borderRadius: 12, boxShadow: '0 6px 24px #3333', fontWeight: 500, padding: '16px 36px', fontSize: 16, transition: '.2s', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>{success ? '✅' : '❌'}</span> <span>{message}</span>
        </div>
    );
}

const UICategoryManage = () => {
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState({show: false, message: '', success: true});
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        // Hiện toast nếu vừa navigate về và có state.toast từ CategoryDetailPage
        if (location.state && location.state.toast) {
            setToast({ ...location.state.toast, show: true });
            // Xóa state trên history để toast chỉ hiện 1 lần duy nhất
            window.history.replaceState({}, document.title);
        }
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        loadCategories(searchParam, pageParam);
    }, [location.search]);

    const loadCategories = async (search = '', currentPage = 1) => {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`http://localhost:5000/api/categories?page=${currentPage}&limit=${limit}${searchQuery}`);
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
            setTotal(data.total || 0);
        } else {
            setCategories([]);
            setTotal(0);
        }
    };

    // actionPerformed() thực hiện lệnh gọi đến lớp CategoryDetailPage
    const handleSelect = (id) => {
        navigate(`/admin/categories/${id}`);
    };

    return (
        <>
            <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast({...toast, show: false})} />
            <div className="admin-card">
                <h2 style={{ color: '#333' }}><FiList /> Quản lý Danh mục sản phẩm</h2>
                <table className="admin-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28' }}>
                            <th style={{ textAlign: 'left', padding: '15px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '15px' }}>Tên danh mục</th>
                            <th style={{ textAlign: 'center', padding: '15px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} style={{ marginBottom: '8px' }}>
                                <td style={{ padding: '15px' }}>{cat.id}</td>
                                <td style={{ fontWeight: '600', padding: '15px' }}>{cat.name}</td>
                                <td style={{ textAlign: 'center', padding: '15px' }}>
                                    <button onClick={() => handleSelect(cat.id)} className="edit-btn">
                                        <FiEdit /> Sửa
                                    </button>
                                </td>
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
                                const params = new URLSearchParams(location.search);
                                const searchParam = params.get('search') || '';
                                loadCategories(searchParam, newPage);
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
                                const params = new URLSearchParams(location.search);
                                const searchParam = params.get('search') || '';
                                loadCategories(searchParam, newPage);
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
            </div>
        </>
    );
};

export default UICategoryManage;