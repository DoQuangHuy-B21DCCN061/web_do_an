import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit3, FiSave, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

const UISupplierManage = () => {
    const location = useLocation();
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [toast, setToast] = useState({ show: false, message: '', success: true });
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        loadSuppliers(searchParam, pageParam);
    }, [location.search]);

    const loadSuppliers = async (search = '', currentPage = 1) => {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`http://localhost:5000/api/suppliers?page=${currentPage}&limit=${limit}${searchQuery}`);
        const data = await res.json();
        if (data.suppliers && Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers);
            setTotal(data.total || 0);
        } else {
            setSuppliers([]);
            setTotal(0);
        }
    };

    const handleEditClick = (s) => {
        setIsEditing(true);
        setCurrentId(s.id);
        setFormData({
            name: s.name,
            phone: s.phone || '',
            email: s.email || '',
            address: s.address || ''
        });
        setShowForm(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `http://localhost:5000/api/suppliers/${currentId}` : 'http://localhost:5000/api/suppliers';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await res.json();

        if (result.success) {
            setToast({ show: true, message: isEditing ? "Thay đổi thành công!" : "Thêm thành công!", success: true });
            setShowForm(false);
            const params = new URLSearchParams(location.search);
            const searchParam = params.get('search') || '';
            loadSuppliers(searchParam, page);
        } else {
            setToast({ show: true, message: result.message || "Thao tác thất bại!", success: false });
        }
    };

    return (
        <>
            <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast({ ...toast, show: false })} />
            <div className="admin-main-wrapper">
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <h2 style={{ color: '#333' }}>🏢 Quản lý Nhà cung cấp</h2>
                    <button onClick={() => { setIsEditing(false); setFormData({ name: '', phone: '', email: '', address: '' }); setShowForm(true); }} className="logout-btn" style={{ background: '#FF8D28' }}>
                        <FiPlus /> Thêm mới
                    </button>
                </div>

                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th>Tên nhà cung cấp</th>
                            <th>Số điện thoại</th>
                            <th>Email</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                                <td style={{ padding: '15px' }}>{s.id}</td>
                                <td style={{ fontWeight: '600' }}>{s.name}</td>
                                <td>{s.phone}</td>
                                <td>{s.email || '-'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button onClick={() => handleEditClick(s)} className="edit-btn" style={{ color: '#FF8D28', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <FiEdit3 size={18} />
                                        </button>
                                        <button style={{ color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
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
                                loadSuppliers(searchParam, newPage);
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
                                loadSuppliers(searchParam, newPage);
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

            {showForm && (
                <div className="admin-card" style={{ marginTop: '30px', borderTop: '4px solid #FF8D28' }}>
                    <h3>{isEditing ? `📝 Sửa Nhà cung cấp #${currentId}` : '➕ Thêm Nhà cung cấp Mới'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="form-group">
                            <label>Tên nhà cung cấp:</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại:</label>
                            <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Địa chỉ:</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="add-btn" style={{ padding: '12px 25px', background: '#FF8D28', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
                                <FiSave /> {isEditing ? 'Xác nhận thay đổi' : 'Lưu nhà cung cấp'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
        </>
    );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' };

export default UISupplierManage;