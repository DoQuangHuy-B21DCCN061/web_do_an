import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

// Toast component
function Toast({ show, message, success = true, onClose }) {
  React.useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2000);
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

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState({ receiver_name: '', receiver_address: '', receiver_phone: '', status: '' });
    const [toast, setToast] = useState({ show: false, message: '', success: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setOrder({
                        receiver_name: data.receiver_name || '',
                        receiver_address: data.receiver_address || '',
                        receiver_phone: data.receiver_phone || '',
                        status: data.status || ''
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                setToast({show:true,message:'Không thể tải thông tin đơn hàng',success:false});
                setLoading(false);
            });
    }, [id]);

    const actionPerformed = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const result = await res.json();

            if (result.success) {
                setToast({show:true,message:'Thay đổi thành công!',success:true});
                setTimeout(() => navigate('/admin/orders'), 1500);
            } else {
                setToast({show:true,message:result.message || 'Thay đổi thất bại!',success:false});
            }
        } catch (err) {
            setToast({show:true,message:'Lỗi khi cập nhật đơn hàng',success:false});
        }
    };

    if (loading) {
        return <div className="admin-card" style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
    }

    return (<>
        <Toast show={toast.show} message={toast.message} success={toast.success} onClose={() => setToast(t => ({ ...t, show: false }))} />
        <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}><FiArrowLeft /></button>
                <h3>📝 Chi tiết Đơn hàng #{id}</h3>
            </div>
            <form onSubmit={actionPerformed} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <input value={order.receiver_name} onChange={e => setOrder({ ...order, receiver_name: e.target.value })} placeholder="Tên người nhận" style={inputStyle} />
                <input value={order.receiver_phone} onChange={e => setOrder({ ...order, receiver_phone: e.target.value })} placeholder="Số điện thoại" style={inputStyle} />
                <input value={order.receiver_address} onChange={e => setOrder({ ...order, receiver_address: e.target.value })} placeholder="Địa chỉ" style={{ ...inputStyle, gridColumn: 'span 2' }} />
                <select value={order.status} onChange={e => setOrder({ ...order, status: e.target.value })} style={inputStyle}>
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                </select>
                <button type="submit" className="add-btn"><FiSave /> Xác nhận thay đổi</button>
            </form>
        </div>
    </>);
};
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
export default OrderDetailPage;