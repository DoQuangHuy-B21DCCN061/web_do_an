import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UILogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // ... các phần khác của UILogin giữ nguyên
    const actionPerformed = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                const loggedInUser = data.user;
                localStorage.setItem('user', JSON.stringify(loggedInUser));

                // BƯỚC HỢP NHẤT GIỎ HÀNG (MERGE)
                const tempCart = JSON.parse(localStorage.getItem('temp_cart'));
                if (tempCart && tempCart.length > 0) {
                    try {
                        await fetch('http://localhost:5000/api/cart/merge', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: loggedInUser.id.trim(),
                                // Map lại để Backend DAO nhận diện đúng trường dữ liệu
                                items: tempCart.map(i => ({
                                    productId: i.id.trim(),
                                    quantity: i.quantity
                                }))
                            })
                        });
                        console.log("Dữ liệu gửi đi merge:", {
                            userId: loggedInUser.id,
                            items: tempCart
                        });
                        localStorage.removeItem('temp_cart');
                    } catch (mergeErr) {
                        console.error("Lỗi merge giỏ hàng:", mergeErr);
                    }
                }

                alert("Đăng nhập thành công!");
                if (loggedInUser.role.toUpperCase() === 'ADMIN') {
                    navigate('/admin/statistic');
                } else {
                    navigate('/');
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };
    // ... phần return JSX giữ nguyên
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2 style={{ color: '#FF8D28' }}>KID & MOM STORE - ĐĂNG NHẬP</h2>
            <form onSubmit={actionPerformed}>
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={styles.input}
                /><br />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                /><br />
                <button type="submit" style={styles.button}>Đăng nhập</button>
            </form>
        </div>
    );
};

const styles = {
    input: { padding: '10px', margin: '5px', width: '250px', borderRadius: '8px', border: '1px solid #ddd' },
    button: { padding: '10px 20px', background: '#FF8D28', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default UILogin;