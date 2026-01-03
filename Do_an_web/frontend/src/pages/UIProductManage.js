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

const UIProductManage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [toast, setToast] = useState({ show: false, message: '', success: true });

    // Khởi tạo đầy đủ các trường theo model Product
    const [formData, setFormData] = useState({
        name: '',
        sell_price: 0,
        quantityInStock: 0,
        description: '',
        image_url: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        loadProducts(searchParam, pageParam);
        loadCategories();
        loadSuppliers();
    }, [location.search]);

    const loadCategories = async () => {
        const res = await fetch('http://localhost:5000/api/categories?page=1&limit=1000');
        const data = await res.json();
        // API trả về { categories: [...], total: ... }
        if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
        } else if (Array.isArray(data)) {
            // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
            setCategories(data);
        } else {
            setCategories([]);
        }
    };

    const loadSuppliers = async () => {
        const res = await fetch('http://localhost:5000/api/suppliers?page=1&limit=1000');
        const data = await res.json();
        // API trả về { suppliers: [...], total: ... }
        if (data.suppliers && Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers.map(sup => ({ ...sup, id: String(sup.id).trim() })));
        } else if (Array.isArray(data)) {
            // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
            setSuppliers(data.map(sup => ({ ...sup, id: String(sup.id).trim() })));
        } else {
            setSuppliers([]);
        }
    };

    // Bước 3-5: Gọi getAllProduct() từ DAO và nhận danh sách
    const loadProducts = async (search = '', currentPage = 1) => {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`http://localhost:5000/api/products?page=${currentPage}&limit=${limit}${searchQuery}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
            setTotal(data.total || 0);
        } else {
            setProducts([]);
            setTotal(0);
        }
    };

    // Xử lý chọn file ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Bước 7-8: Xử lý chọn sản phẩm và mở form chi tiết
    const handleEditClick = async (p) => {
        setIsEditing(true);
        setCurrentId(p.id);
        // Đổ dữ liệu vào Product Entity giả lập ở state
        setFormData({
            name: p.name,
            sell_price: p.sell_price,
            quantityInStock: p.quantityInStock,
            description: p.description || '',
            image_url: p.image_url || ''
        });
        setSelectedImage(null);
        setImagePreview(p.image_url ? `http://localhost:5000${p.image_url}` : null);
        
        // Lấy danh sách categories và suppliers của sản phẩm
        try {
            const res = await fetch(`http://localhost:5000/api/products/${p.id}`);
            const data = await res.json();
            setSelectedCategories(data.categories || []);
            setSelectedSuppliers((data.suppliers || []).map(id => String(id).trim()));
        } catch (err) {
            setSelectedCategories([]);
            setSelectedSuppliers([]);
        }
        
        setShowForm(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setFormData({ name: '', sell_price: 0, quantityInStock: 0, description: '', image_url: '' });
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedCategories([]);
        setSelectedSuppliers([]);
        setShowForm(true);
    };

    // Bước 13-16: Gọi actionPerformed() -> changeProduct() và hiển thị thông báo
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `http://localhost:5000/api/products/${currentId}`
            : 'http://localhost:5000/api/products';
        const method = isEditing ? 'PUT' : 'POST';

        // Tạo FormData để gửi file
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('sell_price', formData.sell_price);
        formDataToSend.append('quantityInStock', formData.quantityInStock);
        formDataToSend.append('description', formData.description || '');
        
        // Thêm categories và suppliers
        selectedCategories.forEach(catId => {
            formDataToSend.append('categories[]', catId);
        });
        selectedSuppliers.forEach(supId => {
            formDataToSend.append('suppliers[]', supId);
        });
        
        // Nếu có ảnh mới được chọn, thêm vào FormData
        if (selectedImage) {
            formDataToSend.append('image', selectedImage);
        }
        
        // Nếu đang sửa, luôn gửi old_image_url để backend biết ảnh cũ (nếu có)
        if (isEditing && formData.image_url) {
            formDataToSend.append('old_image_url', formData.image_url);
        }

        const res = await fetch(url, {
            method: method,
            body: formDataToSend // Không set Content-Type, browser sẽ tự set với boundary
        });
        const result = await res.json();

        if (result.success) {
            setToast({ show: true, message: isEditing ? "Thay đổi sản phẩm thành công!" : "Thêm sản phẩm thành công!", success: true });
            setShowForm(false);
            setSelectedImage(null);
            setImagePreview(null);
            setSelectedCategories([]);
            setSelectedSuppliers([]);
            const params = new URLSearchParams(location.search);
            const searchParam = params.get('search') || '';
            loadProducts(searchParam, page);
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
                    <h2 style={{ color: '#333' }}>📦 Quản lý sản phẩm</h2>
                    <button onClick={handleAddNew} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FF8D28' }}>
                        <FiPlus /> Thêm sản phẩm mới
                    </button>
                </div>

                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Mô tả</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => {
                            const isLowStock = p.quantityInStock <= 5;
                            return (
                                <tr 
                                    key={p.id} 
                                    style={{ 
                                        borderBottom: '1px solid #f2f2f2',
                                        backgroundColor: isLowStock ? '#ffe6e6' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '15px' }}>{p.id}</td>
                                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                                    <td>{p.sell_price?.toLocaleString()}đ</td>
                                    <td style={{ color: isLowStock ? '#d32f2f' : 'inherit', fontWeight: isLowStock ? '600' : 'normal' }}>
                                        {p.quantityInStock}
                                    </td>
                                    <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.description}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                            <button onClick={() => handleEditClick(p)} className="edit-btn" style={{ color: '#FF8D28', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                <FiEdit3 size={18} />
                                            </button>
                                            <button style={{ color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
                                loadProducts(searchParam, newPage);
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
                                loadProducts(searchParam, newPage);
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

            {/* Bước 12: Thông tin chi tiết được hiển thị cho QTV */}
            {showForm && (
                <div className="admin-card" style={{ marginTop: '30px', borderTop: '4px solid #FF8D28' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>{isEditing ? `📝 Sửa Sản Phẩm #${currentId}` : '➕ Thêm Sản Phẩm Mới'}</h3>
                        <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="form-group">
                            <label>Tên sản phẩm:</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group">
                            <label>Giá bán (VNĐ):</label>
                            <input required type="number" value={formData.sell_price} onChange={e => setFormData({ ...formData, sell_price: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group">
                            <label>Số lượng tồn:</label>
                            <input required type="number" value={formData.quantityInStock} onChange={e => setFormData({ ...formData, quantityInStock: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Hình ảnh sản phẩm:</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                style={{ ...inputStyle, padding: '8px' }}
                            />
                            {imagePreview && (
                                <div style={{ marginTop: '10px' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ 
                                            maxWidth: '200px', 
                                            maxHeight: '200px', 
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }} 
                                    />
                                </div>
                            )}
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Mô tả sản phẩm:</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Danh mục sản phẩm:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                {categories.map(cat => (
                                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, cat.id]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                                }
                                            }}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Nhà cung cấp:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                {suppliers.map(sup => (
                                    <label key={sup.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSuppliers.includes(sup.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedSuppliers([...selectedSuppliers, sup.id]);
                                                } else {
                                                    setSelectedSuppliers(selectedSuppliers.filter(id => id !== sup.id));
                                                }
                                            }}
                                        />
                                        <span>{sup.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="add-btn" style={{ padding: '12px 25px', background: '#FF8D28', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                <FiSave /> {isEditing ? 'Xác nhận thay đổi' : 'Lưu sản phẩm'}
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

export default UIProductManage;