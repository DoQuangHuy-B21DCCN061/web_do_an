import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

function Toast({ show, message, success = true, onClose }) {
    React.useEffect(() => {
        if (show) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }
    }, [show, onClose]);
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', zIndex: 9999, top: 24, right: 32, minWidth: 240, background: '#fff', border: `2.5px solid ${success ? "#3fc77a" : "#FF6161"}`, color: success ? '#1d763b' : '#EC1212', borderRadius: 12, boxShadow: '0 6px 24px #3333', fontWeight: 500, padding: '16px 36px', fontSize: 16, transition: '.2s', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>{success ? '✅' : '❌'}</span> <span>{message}</span>
        </div>
    );
}

const CategoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState("");
    const [toast, setToast] = useState({show: false, message: '', success: true});

    useEffect(() => {
        // Gọi hàm getCategory() từ CategoryManageDAO
        fetch(`http://localhost:5000/api/categories/${id}`)
            .then(res => res.json())
            .then(data => setCategoryName(data.name));
    }, [id]);

    const actionPerformed = async (e) => {
        e.preventDefault();
        // Gọi hàm changeCategory() trong CategoryManageDAO
        const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName })
        });
        const result = await res.json();

        if (result.success) {
            navigate('/admin/categories', { state: { toast: { success: true, message: 'Thay đổi danh mục thành công!' } } });
        } else {
            // Hiển thị toast tại chỗ nếu thất bại
            setToast({ show: true, message: result.message || 'Thay đổi thất bại!', success: false });
        }
    };


    return (
        <>
            <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast({...toast, show: false})} />
            <div className="admin-card">
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h3 style={{ marginTop: '20px' }}>📝 Chỉnh sửa Danh mục: {id}</h3>
                <form onSubmit={actionPerformed} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                        <label>Tên danh mục mới:</label>
                        <input
                            required
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }}
                        />
                    </div>
                    <button type="submit" className="add-btn" style={{ marginTop: '20px', background: '#FF8D28', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' }}>
                        <FiSave /> Xác nhận thay đổi
                    </button>
                </form>
            </div>
        </>
    );
};

export default CategoryDetailPage;