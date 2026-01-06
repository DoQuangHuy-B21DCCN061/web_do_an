import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiEdit, FiEye, FiXCircle } from 'react-icons/fi';
// Popup/Toast nhỏ
function Toast({ show, message, success = true, onClose }) {
  React.useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 1800);
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

const UIOrderManage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Toast nhỏ
    const [toast, setToast] = useState({ show: false, message: '', success: true });

    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

    // Đọc search param từ URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search') || '';
        const pageParam = parseInt(params.get('page')) || 1;
        setPage(pageParam);
        
        const searchQuery = searchParam ? `&search=${encodeURIComponent(searchParam)}` : '';
        fetch(`http://localhost:5000/api/orders?page=${pageParam}&limit=${limit}${searchQuery}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Xử lý nhiều format có thể
                if (data && Array.isArray(data.orders)) {
                    setOrders(data.orders);
                    setTotal(data.total || data.orders.length);
                } else if (Array.isArray(data)) {
                    // Fallback: nếu API trả về mảng trực tiếp
                    setOrders(data);
                    setTotal(data.length);
                } else if (data && data.success === false) {
                    // Nếu có lỗi từ backend
                    setToast({show:true,message:data.message || 'Lỗi khi tải danh sách đơn hàng',success:false});
                    setOrders([]);
                    setTotal(0);
                } else {
                    console.warn('Unexpected API response format:', data);
                    setOrders([]);
                    setTotal(0);
                }
            })
            .catch(err => {
                setToast({show:true,message:'Lỗi khi tải danh sách đơn hàng: ' + err.message,success:false});
                setOrders([]);
                setTotal(0);
            });
    }, [page, location.search]);

    const handleFetchOrderDetail = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/order/${id}/detail`);
            const result = await res.json();
            setSelectedOrderDetail(result);
        } catch (err) {
            setSelectedOrderDetail(null);
            setToast({show:true,message:'Không thể tải chi tiết đơn hàng',success:false});
        }
    };

    return (<>
        <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast(t => ({ ...t, show: false }))} />
        <div className="admin-card">
            <h2 style={{ color: '#333' }}><FiShoppingBag /> Quản lý Đơn hàng</h2>
            <table className="admin-table" style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#FFF5EC', color: '#FF8D28' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px' }}>Mã đơn hàng</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px' }}>Khách hàng</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px' }}>Ngày đặt</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px' }}>Trạng thái</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                Không có đơn hàng nào
                            </td>
                        </tr>
                    ) : (
                        orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f2f2f2', height: 54 }}>
                            <td style={{ textAlign: 'left', padding: '10px 12px' }}>{o.id}</td>
                            <td style={{ textAlign: 'left', padding: '10px 12px' }}>{o.receiver_name}</td>
                            <td style={{ textAlign: 'left', padding: '10px 12px' }}>{new Date(o.order_date).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'left', padding: '10px 12px' }}><strong>{o.status}</strong></td>
                            <td style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
  <button 
    onClick={() => navigate(`/admin/orders/${o.id}`)}
    className="edit-btn" 
    style={{ background: '#FFF5EC', border: '1px solid #FF8D28', color: '#FF8D28', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 16, transition: 'all 0.2s', boxShadow: '0 1px 6px #FAEEE5' }}>
    <FiEdit style={{ marginRight: 7 }} /> Sửa
  </button>
  <button
    onClick={() => handleFetchOrderDetail(o.id)}
    className="detail-btn"
    style={{ background: '#FFF5EC', border: '1px solid #F76C20', color: '#F76C20', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 16, transition: 'all 0.2s', boxShadow: '0 1px 6px #FAEEE5' }}
    title="Xem chi tiết"
  >
    <FiEye style={{ marginRight: 7 }} /> Chi tiết
  </button>
</td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        {selectedOrderDetail && (
          <div className="order-detail-modal" style={{ background: '#fff', borderRadius: 12, padding: 24, marginTop: 20, boxShadow: '0 2px 16px #ddd', position: 'relative', zIndex: 10 }}>
              <button onClick={() => setSelectedOrderDetail(null)} style={{ position: 'absolute', right: 16, top: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}><FiXCircle /></button>
              <h3>Chi tiết đơn hàng: <span style={{ color: '#f76c20' }}>{selectedOrderDetail.orderId}</span></h3>
              <div><b>Tên người nhận:</b> {selectedOrderDetail.customerInfo?.name || '-'}</div>
              <div><b>SĐT:</b> {selectedOrderDetail.customerInfo?.phone || '-'}</div>
              <div><b>Địa chỉ:</b> {selectedOrderDetail.customerInfo?.address || '-'}</div>
              <div><b>Phương thức thanh toán:</b> {selectedOrderDetail.paymentMethod || '-'}</div>
              <div><b>Trạng thái: </b>{selectedOrderDetail.status || '-'}</div>
              <div><b>Tổng sản phẩm:</b> {selectedOrderDetail.totalProduct ?? '-'}</div>
              <div><b>Tổng tiền:</b> {selectedOrderDetail.totalAmount ? selectedOrderDetail.totalAmount.toLocaleString() + ' VND' : '-'}</div>
              <div><b>Ngày đặt: </b>{selectedOrderDetail.orderDate ? (new Date(selectedOrderDetail.orderDate).toLocaleString()) : '-'}</div>
              <h4 style={{ marginTop: 18 }}>Sản phẩm trong đơn</h4>
              <table style={{ width: '100%', border: '1px solid #eee', borderRadius: 5 }}>
                  <thead>
                  <tr style={{ background: '#FAEEE5' }}>
                      <th style={{ textAlign: 'left' }}>Tên sản phẩm</th>
                      <th style={{ textAlign: 'left' }}>Số lượng</th>
                      <th style={{ textAlign: 'left' }}>Đơn giá (VND)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {(selectedOrderDetail.items || []).map((it, idx) => (
                      <tr key={idx}>
                          <td style={{ textAlign: 'left' }}>{it.product_name}</td>
                          <td style={{ textAlign: 'left' }}>{it.quantity}</td>
                          <td style={{ textAlign: 'left' }}>{it.price?.toLocaleString()}</td>
                      </tr>
                  ))}
                  </tbody>
              </table>
          </div>
        )}
    {/* PHÂN TRANG */}
    <div style={{marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap:8}}>
      <button 
        disabled={page <= 1}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        style={{padding:'6px 12px', borderRadius:4, border:'1px solid #bbb', background: page <= 1?'#eee':'#fff', cursor: page <= 1?'not-allowed':'pointer'}}>
        &lt;
      </button>
      <span style={{margin:'0 12px'}}>Trang {page} / {Math.ceil(total / limit) || 1}</span>
      <button 
        disabled={page >= Math.ceil(total/limit)}
        onClick={() => setPage(p => Math.min(Math.ceil(total/limit), p + 1))}
        style={{padding:'6px 12px', borderRadius:4, border:'1px solid #bbb', background: page >= Math.ceil(total/limit)?'#eee':'#fff', cursor: page >= Math.ceil(total/limit)?'not-allowed':'pointer'}}>
        &gt;
      </button>
    </div>
  </div>
  </>
  );
};
export default UIOrderManage;