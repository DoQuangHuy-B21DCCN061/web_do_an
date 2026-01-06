import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';

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

const UIImportProduct = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]); // Tất cả nhà cung cấp
    const [availableSuppliers, setAvailableSuppliers] = useState([]); // Nhà cung cấp của sản phẩm đã chọn
    const [toast, setToast] = useState({ show: false, message: '', success: true });
    
    const [formData, setFormData] = useState({
        productId: '',
        supplierId: '',
        quantity: '',
        importPrice: ''
    });

    useEffect(() => {
        loadProducts();
        loadAllSuppliers();
    }, []);

    // Khi allSuppliers đã load và có productId, load lại suppliers của sản phẩm
    useEffect(() => {
        if (formData.productId && allSuppliers.length > 0) {
            loadProductSuppliers(formData.productId);
        }
    }, [allSuppliers]);

    const loadProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products?page=1&limit=1000');
            const data = await res.json();
            if (data.products && Array.isArray(data.products)) {
                setProducts(data.products);
            } else if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách sản phẩm:", err);
            setProducts([]);
        }
    };

    const loadAllSuppliers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/suppliers?page=1&limit=1000');
            const data = await res.json();
            if (data.suppliers && Array.isArray(data.suppliers)) {
                setAllSuppliers(data.suppliers);
            } else if (Array.isArray(data)) {
                setAllSuppliers(data);
            } else {
                setAllSuppliers([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách nhà cung cấp:", err);
            setAllSuppliers([]);
        }
    };

    // Load suppliers của sản phẩm đã chọn
    const loadProductSuppliers = async (productId) => {
        if (!productId) {
            setAvailableSuppliers([]);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/products/${productId}`);
            const data = await res.json();
            
            if (data.suppliers && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
                // Lấy thông tin đầy đủ của suppliers từ allSuppliers
                const supplierIds = data.suppliers.map(id => String(id).trim());
                const suppliersInfo = allSuppliers.filter(sup => 
                    supplierIds.includes(String(sup.id).trim())
                );
                setAvailableSuppliers(suppliersInfo);
            } else {
                setAvailableSuppliers([]);
                setToast({ 
                    show: true, 
                    message: 'Sản phẩm này chưa có nhà cung cấp. Vui lòng gắn nhà cung cấp cho sản phẩm trước!', 
                    success: false 
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải nhà cung cấp của sản phẩm:", err);
            setAvailableSuppliers([]);
        }
    };

    // Xử lý khi chọn sản phẩm
    const handleProductChange = (productId) => {
        setFormData({
            ...formData,
            productId: productId,
            supplierId: '' // Reset supplier khi đổi sản phẩm
        });
        loadProductSuppliers(productId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.productId || !formData.supplierId || !formData.quantity || !formData.importPrice) {
            setToast({ show: true, message: 'Vui lòng điền đầy đủ thông tin!', success: false });
            return;
        }

        if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.importPrice) <= 0) {
            setToast({ show: true, message: 'Số lượng và giá nhập phải lớn hơn 0!', success: false });
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/products/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: formData.productId,
                    supplierId: formData.supplierId,
                    quantity: parseInt(formData.quantity),
                    importPrice: parseFloat(formData.importPrice)
                })
            });

            const result = await res.json();

            if (result.success) {
                setToast({ show: true, message: 'Nhập sản phẩm thành công!', success: true });
                // Reset form
                setFormData({
                    productId: '',
                    supplierId: '',
                    quantity: '',
                    importPrice: ''
                });
                // Navigate back after 1.5 seconds
                setTimeout(() => {
                    navigate('/admin/products');
                }, 1500);
            } else {
                setToast({ show: true, message: result.message || 'Nhập sản phẩm thất bại!', success: false });
            }
        } catch (err) {
            console.error("Lỗi khi nhập sản phẩm:", err);
            setToast({ show: true, message: 'Lỗi hệ thống!', success: false });
        }
    };

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' };

    return (
        <>
            <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast({ ...toast, show: false })} />
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
                            <h2 style={{ color: '#333', margin: 0 }}>📦 Nhập sản phẩm</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Chọn sản phẩm: <span style={{ color: 'red' }}>*</span></label>
                            <select 
                                required
                                value={formData.productId} 
                                onChange={e => handleProductChange(e.target.value)} 
                                style={inputStyle}
                            >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (ID: {product.id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                Chọn nhà cung cấp: <span style={{ color: 'red' }}>*</span>
                                {formData.productId && availableSuppliers.length === 0 && (
                                    <span style={{ color: '#ff9800', fontSize: '12px', marginLeft: '10px', fontWeight: 'normal' }}>
                                        (Sản phẩm này chưa có nhà cung cấp)
                                    </span>
                                )}
                            </label>
                            <select 
                                required
                                value={formData.supplierId} 
                                onChange={e => setFormData({ ...formData, supplierId: e.target.value })} 
                                style={inputStyle}
                                disabled={!formData.productId || availableSuppliers.length === 0}
                            >
                                <option value="">
                                    {!formData.productId 
                                        ? '-- Vui lòng chọn sản phẩm trước --'
                                        : availableSuppliers.length === 0
                                        ? '-- Sản phẩm này chưa có nhà cung cấp --'
                                        : '-- Chọn nhà cung cấp --'}
                                </option>
                                {availableSuppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name} (ID: {supplier.id})
                                    </option>
                                ))}
                            </select>
                            {formData.productId && availableSuppliers.length > 0 && (
                                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                    Chỉ hiển thị {availableSuppliers.length} nhà cung cấp đã được gắn với sản phẩm này
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Số lượng nhập: <span style={{ color: 'red' }}>*</span></label>
                            <input 
                                required
                                type="number" 
                                min="1"
                                value={formData.quantity} 
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })} 
                                style={inputStyle}
                                placeholder="Nhập số lượng"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Giá nhập (VNĐ): <span style={{ color: 'red' }}>*</span></label>
                            <input 
                                required
                                type="number" 
                                min="0"
                                step="0.01"
                                value={formData.importPrice} 
                                onChange={e => setFormData({ ...formData, importPrice: e.target.value })} 
                                style={inputStyle}
                                placeholder="Nhập giá nhập"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Ngày nhập:</label>
                            <input 
                                type="text" 
                                value={new Date().toLocaleDateString('vi-VN')} 
                                disabled
                                style={{ ...inputStyle, background: '#f5f5f5', color: '#666' }}
                            />
                            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                Ngày nhập sẽ tự động được lưu là ngày hiện tại
                            </small>
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button 
                                type="submit" 
                                className="add-btn" 
                                style={{ 
                                    padding: '12px 25px', 
                                    background: '#28a745', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiSave /> Lưu phiếu nhập
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/admin/products')} 
                                style={{ 
                                    padding: '12px 25px', 
                                    background: '#6c757d', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiX /> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UIImportProduct;

