// frontend/src/pages/SupplierDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SupplierDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState({ name: '', phone: '' });

    useEffect(() => {
        fetch(`http://localhost:5000/api/suppliers/${id}`)
            .then(res => res.json())
            .then(data => setSupplier(data));
    }, [id]);

    const handleUpdate = async () => {
        const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier)
        });
        const result = await response.json();

        if (result.success) {
            alert("Thông báo: Thay đổi thành công!"); // display success
            navigate('/admin/suppliers');
        } else {
            alert("Thông báo: Thay đổi thất bại!"); // display fail
        }
    };

    return (
        <div className="admin-card">
            <h3>Chỉnh sửa nhà cung cấp</h3>
            <input value={supplier.name} onChange={e => setSupplier({ ...supplier, name: e.target.value })} />
            <input value={supplier.phone} onChange={e => setSupplier({ ...supplier, phone: e.target.value })} />
            <button onClick={handleUpdate} className="add-btn">Xác nhận thay đổi</button>
        </div>
    );
};

export default SupplierDetailPage;