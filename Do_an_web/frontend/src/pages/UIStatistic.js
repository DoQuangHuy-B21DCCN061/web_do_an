import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiFilter, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const UIStatistic = () => {
    const [chartData, setChartData] = useState([]);
    const [config, setConfig] = useState({
        statCategory: 'revenue', // revenue, products, customers
        type: 'dailyInMonth',    // dailyInMonth, monthlyInYear
        month: new Date().getMonth() + 1,
        year: 2026               // Hiện tại là năm 2026
    });

    // Bước 2, 14: Lớp UIStatistic gọi hàm actionPerformed()
    const actionPerformed = async () => {
        const { statCategory, type, month, year } = config;
        const query = `?type=${type}&month=${month}&year=${year}`;

        // Bước 3, 4, 15, 16: Xác định endpoint dựa trên loại thống kê
        // Sản phẩm hiện tại được đổi sang endpoint products-quantity để lấy dữ liệu theo thời gian
        let endpoint = statCategory === 'revenue' ? `revenue${query}` :
            statCategory === 'products' ? `products-quantity${query}` : `top-customers${query}`;

        try {
            // Gọi API đến Backend khớp với server.js (/api/statistics)
            const res = await fetch(`http://localhost:5000/api/statistics/${endpoint}`);
            if (!res.ok) throw new Error("Lỗi kết nối máy chủ");
            const data = await res.json();

            let formatted = [];

            // Bước 9, 12, 24: Xử lý dữ liệu đã được các lớp thực thể đóng gói
            if (statCategory === 'revenue' || statCategory === 'products') {
                const map = {};
                data.forEach(item => {
                    // Lấy ngày từ Bill (revenue) hoặc Order (products)
                    const dateStr = item.bill_date || item.order.order_date;
                    const date = new Date(dateStr);
                    const k = type === 'dailyInMonth' ? `Ngày ${date.getDate()}` : `Tháng ${date.getMonth() + 1}`;

                    // Cộng dồn: total_price (doanh thu từ Bill) hoặc detail.quantity (số lượng từ OrderDetail)
                    const val = statCategory === 'revenue' ? item.total_price : item.detail.quantity;
                    map[k] = (map[k] || 0) + val;
                });

                // Sắp xếp nhãn theo thứ tự số (Ngày 1 -> Ngày 31) để biểu đồ không bị nhảy bậc
                formatted = Object.keys(map)
                    .sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
                    .map(k => ({ label: k, value: map[k] }));

            } else {
                // Khách hàng vẫn giữ nguyên hiển thị bảng xếp hạng (Top Ranking)
                // Truy cập dữ liệu từ User (name) và Bill (total_price)
                formatted = data.map(item => ({
                    label: item.name,
                    value: item.bill.total_price
                }));
            }

            setChartData(formatted);
        } catch (error) {
            console.error("Lỗi fetch dữ liệu thống kê:", error);
            setChartData([]);
        }
    };

    // Tự động gọi lại khi cấu hình bộ lọc thay đổi
    useEffect(() => { actionPerformed(); }, [config]);

    // Màu sắc biểu đồ tự động thay đổi theo loại thống kê
    const getChartColor = () => {
        if (config.statCategory === 'products') return '#3498db'; // Xanh dương cho sản phẩm
        if (config.statCategory === 'customers') return '#2ecc71'; // Xanh lá cho khách hàng
        return '#FF8D28'; // Cam cho doanh thu
    };

    return (
        <div className="admin-card">
            <h2 style={{ color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiBarChart2 color={getChartColor()} /> Thống kê Quản trị Hệ thống
            </h2>

            <div style={filterContainerStyle}>
                {/* 1. Chọn Loại thống kê */}
                <div style={filterGroupStyle}>
                    <label style={labelStyle}><FiFilter /> Loại thống kê:</label>
                    <select value={config.statCategory} onChange={e => setConfig({ ...config, statCategory: e.target.value })} style={selectStyle}>
                        <option value="revenue">💰 Thống kê doanh thu</option>
                        <option value="products">📦 Số lượng hàng bán ra</option>
                        <option value="customers">💎 Khách hàng theo doanh thu</option>
                    </select>
                </div>

                {/* 2. Bộ lọc thời gian */}
                <div style={filterGroupStyle}>
                    <label style={labelStyle}><FiCalendar /> Chế độ xem:</label>
                    <select value={config.type} onChange={e => setConfig({ ...config, type: e.target.value })} style={selectStyle}>
                        <option value="dailyInMonth">Xem theo ngày (trong tháng)</option>
                        <option value="monthlyInYear">Xem theo tháng (trong năm)</option>
                    </select>
                </div>

                {config.type === 'dailyInMonth' && (
                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Tháng:</label>
                        <select value={config.month} onChange={e => setConfig({ ...config, month: e.target.value })} style={selectStyle}>
                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                        </select>
                    </div>
                )}

                <div style={filterGroupStyle}>
                    <label style={labelStyle}>Năm:</label>
                    <select value={config.year} onChange={e => setConfig({ ...config, year: e.target.value })} style={selectStyle}>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                <div style={{ alignSelf: 'flex-end' }}>
                    <button onClick={actionPerformed} className="add-btn" style={{ background: getChartColor(), height: '40px' }}>Lọc thống kê</button>
                </div>
            </div>

            {/* Biểu đồ tự thích ứng đơn vị và màu sắc */}
            <div style={{ width: '100%', height: 400, marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="label" fontSize={11} tick={{ fill: '#666' }} />
                        <YAxis tickFormatter={(val) => val.toLocaleString('vi-VN')} fontSize={11} />
                        <Tooltip
                            formatter={(val) => [
                                val.toLocaleString('vi-VN') + (config.statCategory === 'products' ? ' SP' : ' VNĐ'),
                                'Giá trị'
                            ]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={35}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getChartColor()} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Styles hỗ trợ hiển thị
const filterContainerStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee' };
const filterGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#555' };
const selectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '160px', outline: 'none' };

export default UIStatistic;