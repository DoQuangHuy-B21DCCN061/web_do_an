import React, { useState, useEffect, useCallback } from 'react';
import { FiBarChart2, FiFilter, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const UIStatistic = () => {
    const [chartData, setChartData] = useState([]);
    const [config, setConfig] = useState({
        statCategory: 'revenue', // revenue, products, customers
        type: 'dailyInMonth',    // dailyInMonth, monthlyInYear
        month: new Date().getMonth() + 1,
        year: 2026,              // Hiện tại là năm 2026
        topLimit: 10             // Số lượng top hiển thị: 5, 10, 15, 20
    });

    // Bước 2, 14: Lớp UIStatistic gọi hàm actionPerformed()
    const actionPerformed = useCallback(async () => {
        const { statCategory, type, month, year, topLimit } = config;
        const query = `?type=${type}&month=${month}&year=${year}&limit=${topLimit}`;

        // Bước 3, 4, 15, 16: Xác định endpoint dựa trên loại thống kê
        // Sản phẩm hiện tại được đổi sang endpoint top-selling-products để lấy dữ liệu theo thời gian
        let endpoint = statCategory === 'revenue' ? `revenue${query}` :
            statCategory === 'topproducts' ? `top-products${query}` : `top-customers${query}`;

        try {
            // Gọi API đến Backend khớp với server.js (/api/statistics)
            const res = await fetch(`http://localhost:5000/api/statistics/${endpoint}`);
            if (!res.ok) throw new Error("Lỗi kết nối máy chủ");
            const data = await res.json();

            console.log(`[${statCategory}] Raw data from API:`, data);
            console.log(`[${statCategory}] Data length:`, Array.isArray(data) ? data.length : 'Not an array');

            let formatted = [];

            // Bước 9, 12, 24: Xử lý dữ liệu đã được các lớp thực thể đóng gói
            if (statCategory === 'topproducts') {
                formatted = data.map(item => ({
                    label: item.product_name,
                    value: item.total_quantity
                }));
            } else if (statCategory === 'revenue') {
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('[revenue] No data or not an array');
                    formatted = [];
                } else {
                    const map = {};
                    data.forEach((item, index) => {
                        console.log(`[revenue] Item ${index}:`, item);
                        // Lấy ngày từ Bill
                        const dateStr = item.bill_date;
                        if (!dateStr) {
                            console.warn(`[revenue] Item ${index} has no bill_date`);
                            return;
                        }
                        
                        // Xử lý date - có thể là string hoặc Date object
                        let date;
                        if (dateStr instanceof Date) {
                            date = dateStr;
                        } else if (typeof dateStr === 'string') {
                            date = new Date(dateStr);
                        } else {
                            console.warn(`[revenue] Item ${index} has invalid date format:`, dateStr);
                            return;
                        }
                        
                        if (isNaN(date.getTime())) {
                            console.warn(`[revenue] Item ${index} has invalid date:`, dateStr);
                            return;
                        }
                        
                        const k = type === 'dailyInMonth' ? `Ngày ${date.getDate()}` : `Tháng ${date.getMonth() + 1}`;

                        // Cộng dồn total_price
                        const val = parseFloat(item.total_price);
                        if (isNaN(val) || val <= 0) {
                            console.warn(`[revenue] Item ${index} has invalid total_price:`, item.total_price);
                            return;
                        }
                        
                        map[k] = (map[k] || 0) + val;
                    });

                    console.log('[revenue] Map after processing:', map);

                    // Sắp xếp nhãn theo thứ tự số, sau đó sắp xếp theo giá trị giảm dần và lấy top
                    formatted = Object.keys(map)
                        .sort((a, b) => {
                            const numA = parseInt(a.split(' ')[1]);
                            const numB = parseInt(b.split(' ')[1]);
                            return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
                        })
                        .map(k => ({ label: k, value: map[k] }))
                        .sort((a, b) => b.value - a.value) // Sắp xếp theo giá trị giảm dần
                        .slice(0, topLimit); // Giới hạn số lượng
                }
            } else if (statCategory === 'customers') {
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('[customers] No data or not an array');
                    formatted = [];
                } else {
                    formatted = data
                        .map((item, index) => {
                            console.log(`[customers] Item ${index}:`, item);
                            const name = item.name || 'N/A';
                            const spent = parseFloat(item.spent || 0);
                            if (isNaN(spent)) {
                                console.warn(`[customers] Item ${index} has invalid spent:`, item.spent);
                            }
                            return {
                                label: name,
                                value: isNaN(spent) ? 0 : spent
                            };
                        })
                        .slice(0, topLimit); // Giới hạn số lượng
                }
            }

            console.log(`[${statCategory}] Formatted data:`, formatted);
            setChartData(formatted);
        } catch (error) {
            console.error("Lỗi fetch dữ liệu thống kê:", error);
            setChartData([]);
        }
    }, [config]);

    // Tự động gọi lại khi cấu hình bộ lọc thay đổi
    useEffect(() => { actionPerformed(); }, [actionPerformed]);

    // Màu sắc biểu đồ tự động thay đổi theo loại thống kê
    const getChartColor = () => {
        if (config.statCategory === 'topproducts') return '#3498db'; // Xanh dương cho top sản phẩm
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
                        <option value="topproducts">🏆 Top sản phẩm bán chạy</option>
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

                <div style={filterGroupStyle}>
                    <label style={labelStyle}>Top:</label>
                    <select value={config.topLimit} onChange={e => setConfig({ ...config, topLimit: parseInt(e.target.value) })} style={selectStyle}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>

                <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
                    <button onClick={actionPerformed} className="add-btn" style={{ background: getChartColor(), height: '40px', padding: '8px 20px', whiteSpace: 'nowrap' }}>Lọc thống kê</button>
                </div>
            </div>

            {/* Biểu đồ tự thích ứng đơn vị và màu sắc */}
            <div style={{ width: '100%', height: 400, marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', minHeight: 400 }}>
                {chartData.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999', fontSize: '16px' }}>
                        Không có dữ liệu để hiển thị cho khoảng thời gian đã chọn
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={360}>
                        <BarChart data={chartData} layout={config.statCategory === 'topproducts' ? 'vertical' : 'horizontal'}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        {config.statCategory === 'topproducts' ? (
                            <>
                                <XAxis type="number" tickFormatter={(val) => val.toLocaleString('vi-VN')} fontSize={11} />
                                <YAxis dataKey="label" type="category" width={150} fontSize={11} tick={{ fill: '#666' }} />
                            </>
                        ) : (
                            <>
                                <XAxis dataKey="label" type="category" fontSize={11} tick={{ fill: '#666' }} />
                                <YAxis type="number" tickFormatter={(val) => val.toLocaleString('vi-VN')} fontSize={11} />
                            </>
                        )}
                        <Tooltip
                            formatter={(val) => {
                                if (config.statCategory === 'topproducts') {
                                    return [val.toLocaleString('vi-VN') + ' sản phẩm', 'Số lượng'];
                                } else if (config.statCategory === 'revenue' || config.statCategory === 'customers') {
                                    return [val.toLocaleString('vi-VN') + ' VNĐ', 'Giá trị'];
                                }
                                return [val.toLocaleString('vi-VN'), 'Giá trị'];
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={35}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getChartColor()} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                )}
            </div>

            {/* Bảng liệt kê dữ liệu */}
            {chartData.length > 0 && (
                <div className="admin-card" style={{ marginTop: '30px' }}>
                    <h3 style={{ color: '#333', marginBottom: '20px' }}>
                        {config.statCategory === 'revenue' ? '📊 Chi tiết doanh thu' :
                         config.statCategory === 'topproducts' ? '📦 Chi tiết sản phẩm bán chạy' :
                         '💎 Chi tiết khách hàng'}
                    </h3>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#FFF5EC', color: '#FF8D28', textAlign: 'left' }}>
                                <th style={{ padding: '15px', width: '60px' }}>STT</th>
                                <th style={{ padding: '15px' }}>
                                    {config.statCategory === 'revenue' ? 'Ngày/Tháng' :
                                     config.statCategory === 'topproducts' ? 'Tên sản phẩm' :
                                     'Tên khách hàng'}
                                </th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>
                                    {config.statCategory === 'topproducts' ? 'Số lượng bán' : 'Giá trị'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((item, index) => (
                                <tr 
                                    key={index}
                                    style={{ 
                                        borderBottom: '1px solid #f2f2f2'
                                    }}
                                >
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{index + 1}</td>
                                    <td style={{ padding: '15px', fontWeight: '600' }}>{item.label}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', color: '#28a745', fontWeight: '600' }}>
                                        {config.statCategory === 'topproducts' 
                                            ? `${item.value.toLocaleString('vi-VN')} sản phẩm`
                                            : `${item.value.toLocaleString('vi-VN')} VNĐ`
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Styles hỗ trợ hiển thị
const filterContainerStyle = { display: 'flex', gap: '15px', flexWrap: 'nowrap', alignItems: 'flex-end', background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #eee' };
const filterGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px', flexShrink: 0 };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' };
const selectStyle = { padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '100px', outline: 'none', fontSize: '13px' };

export default UIStatistic;