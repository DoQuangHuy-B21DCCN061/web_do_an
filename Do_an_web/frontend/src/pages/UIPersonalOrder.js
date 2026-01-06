import React, { useState, useEffect } from 'react';
import { FiPackage, FiEye, FiXCircle, FiUser, FiStar, FiLogOut } from 'react-icons/fi';
import '../assets/css/UIPersonalInfo.css'; // Dùng chung CSS mẫu cam

const UIPersonalOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser?.id) {
            const res = await fetch(`http://localhost:5000/api/orders/user/${savedUser.id}`);
            const data = await res.json();
            if (data.success) setOrders(data.orders);
            setLoading(false);
        }
    };

    // Bước 21: Hàm actionPerformed xử lý hủy đơn
    const handleCancel = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        try {
            const res = await fetch('http://localhost:5000/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId })
            });
            const result = await res.json();

            if (result.success) {
                alert("Hủy đơn hàng thành công!"); // Bước 33
                fetchOrders(); // Load lại danh sách
            } else {
                alert("Hủy thất bại: " + result.message); // Bước 31
            }
        } catch (err) {
            alert("Lỗi kết nối.");
        }
    };

    if (loading) return <div className="loading-text">Đang tải đơn hàng...</div>;

    const handleFetchOrderDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/order/${id}/detail`);
            const result = await res.json();
            setSelectedOrderDetail(result);
        } catch {
            setSelectedOrderDetail(null);
        }
        setDetailLoading(false);
    };

    return (
        <div className="profile-page">
            <div className="profile-layout">

                <main className="profile-content">
                    <h2>Đơn hàng của tôi</h2>
                    <div className="order-list">
                        {orders.map(order => (
                            <div key={order.id} className="detail-card" style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold', margin: 0 }}>Mã đơn: {order.id}</p>
                                        <small style={{ color: '#888' }}>Ngày đặt: {new Date(order.order_date).toLocaleDateString()}</small>
                                        <div style={{
                                            marginTop: '5px',
                                            color: order.status === 'Cancelled' ? 'red' : '#FF8D28',
                                            fontWeight: 'bold'
                                        }}>
                                            Trạng thái: {order.status}
                                        </div>
                                    </div>
                                    <div className="order-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <button
                                            onClick={() => handleFetchOrderDetail(order.id)}
                                            title="Xem chi tiết"
                                            style={{ background: 'none', border: '1px solid #F76C20', color: '#F76C20', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', marginRight:'5px' }}
                                        >
                                            <FiEye /> Xem chi tiết
                                        </button>
                                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                style={{ background: 'none', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                                            >
                                                <FiXCircle /> Hủy đơn
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedOrderDetail && (
                      <div className="order-detail-modal" style={{ background: '#fff', borderRadius: 12, padding: 24, marginTop: 20, boxShadow: '0 2px 16px #ddd', position: 'relative' }}>
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
                </main>
            </div>
        </div>
    );
};

export default UIPersonalOrder;