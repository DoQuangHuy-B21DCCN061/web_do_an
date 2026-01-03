import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiUsers, FiEdit3, FiSave, FiX, FiCheckCircle, FiLock } from 'react-icons/fi';

const UICustomerManage = () => {
    const location = useLocation();
    const [customers, setCustomers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', points: 0, status: 1
    });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    // Modal State
    const [modal, setModal] = useState({ show: false, message: '', success: true });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        loadCustomers(pageParam, searchParam);
    }, [location.search]);

    const loadCustomers = async (currentPage = 1, search = '') => {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`http://localhost:5000/api/customers?page=${currentPage}${searchQuery}`);
        const data = await res.json();
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setTotal(data.total || 0);
    };


    const handleEditClick = (c) => {
        setCurrentId(c.id);
        // Đổ toàn bộ dữ liệu vào Form (Gồm cả Status dạng 1/0)
        setFormData({
            name: c.name, phone: c.phone, email: c.email || '',
            address: c.address || '', points: c.points || 0, status: c.status
        });
        setShowForm(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lớp CustomerDetailPage gọi hàm changeCustomer()
        const res = await fetch(`http://localhost:5000/api/customers/${currentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await res.json();

        if (result.success) {
            setModal({ show: true, message: "Thay đổi thành công!", success: true });
            setShowForm(false);
            const params = new URLSearchParams(location.search);
            const searchParam = params.get('search') || '';
            loadCustomers(page, searchParam);
        } else {
            setModal({ show: true, message: (result.message || "Thay đổi thất bại!"), success: false });
        }
    };

    // Modal close + auto close
    useEffect(() => {
        if (modal.show) {
            const t = setTimeout(() => setModal(m => ({ ...m, show: false })), 2000);
            return () => clearTimeout(t);
        }
    }, [modal.show]);

    const closeModal = () => setModal(m => ({ ...m, show: false }));

    return (
        <div className="admin-main-wrapper">
            {/* MODAL POPUP SUCCESS/FAIL */}
            {modal.show && (
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100}}>
                    <div style={{background:'#fff', minWidth:340, padding:'32px 24px', borderRadius:12, boxShadow:'0 6px 24px #3334', textAlign:'center', borderTop:`6px solid ${modal.success ? '#3fc77a' : '#ff6161'}`}}>
                        <div style={{fontSize:32, marginBottom:8}}>{modal.success ? '✅' : '❌'}</div>
                        <div style={{fontSize:18, marginBottom:16, color:modal.success?'#1d763b':'#ec1212', fontWeight:500}}>{modal.message}</div>
                        <button onClick={closeModal} style={{padding:'8px 22px', borderRadius:6, background:'#FF8D28', border:'none', color:'#fff', fontWeight:600, cursor:'pointer'}}>Đóng</button>
                    </div>
                </div>
            )}
            <div className="admin-card">
                <h2 style={{ color: '#333', marginBottom: '20px' }}><FiUsers /> Quản lý Khách hàng</h2>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FFF5EC', color: '#FF8D28', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th>Họ và Tên</th>
                            <th>Liên hệ</th>
                            <th>Điểm</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                                <td style={{ padding: '15px' }}>{c.id}</td>
                                <td style={{ fontWeight: '600' }}>{c.name}</td>
                                <td style={{ fontSize: '13px' }}>{c.phone}<br /><span style={{ color: '#999' }}>{c.email}</span></td>
                                <td style={{ fontWeight: 'bold' }}>{c.points}</td>
                                <td>
                                    <span style={{
                                        padding: '5px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold',
                                        background: c.status === 1 ? '#E6FFFA' : '#FFF1F0',
                                        color: c.status === 1 ? '#38B2AC' : '#F5222D'
                                    }}>
                                        {c.status === 1 ? <><FiCheckCircle /> Hoạt động</> : <><FiLock /> Bị khoá</>}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button onClick={() => handleEditClick(c)} style={{ color: '#FF8D28', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <FiEdit3 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* PHÂN TRANG DƯỚI */}
                <div style={{marginTop: 20, display:'flex', justifyContent:'center', alignItems:'center', gap:8}}>
                  <button 
                    disabled={page <= 1}
                    onClick={() => {
                        const params = new URLSearchParams(location.search);
                        const searchParam = params.get('search') || '';
                        params.set('page', (page - 1).toString());
                        window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
                        setPage(page - 1);
                    }}
                    style={{padding:'6px 12px', borderRadius:4, border:'1px solid #bbb', background: page <= 1?'#eee':'#fff', cursor: page <= 1?'not-allowed':'pointer'}}>
                    &lt;
                  </button>
                  <span style={{margin:'0 12px'}}>Trang {page} / {Math.ceil(total / limit) || 1}</span>
                  <button 
                    disabled={page >= Math.ceil(total/limit)}
                    onClick={() => {
                        const params = new URLSearchParams(location.search);
                        const searchParam = params.get('search') || '';
                        params.set('page', (page + 1).toString());
                        window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
                        setPage(page + 1);
                    }}
                    style={{padding:'6px 12px', borderRadius:4, border:'1px solid #bbb', background: page >= Math.ceil(total/limit)?'#eee':'#fff', cursor: page >= Math.ceil(total/limit)?'not-allowed':'pointer'}}>
                    &gt;
                  </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-card" style={{ marginTop: '30px', borderTop: '4px solid #FF8D28' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>📝 Thông tin chi tiết khách hàng #{currentId}</h3>
                        <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div><label>Họ tên:</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} /></div>
                        <div><label>Số điện thoại:</label><input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
                        <div><label>Email:</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
                        <div><label>Điểm tích lũy:</label><input type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: e.target.value })} style={inputStyle} /></div>

                        {/* Lựa chọn trạng thái BIT */}
                        <div>
                            <label>Trạng thái tài khoản:</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })} style={inputStyle}>
                                <option value={1}>Hoạt động</option>
                                <option value={0}>Bị khoá</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}><label>Địa chỉ:</label><input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="add-btn" style={{ padding: '12px 25px', background: '#FF8D28', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <FiSave /> Xác nhận thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' };

export default UICustomerManage;